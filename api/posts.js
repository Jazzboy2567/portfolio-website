const auth = require('./_lib/auth');
const { getStore } = require('./_lib/store');
const frontmatter = require('../src/frontmatter');
const projects = require('../content/projects.json');
const certs = require('../content/certifications.json');

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const SLUG_RE = /^\d{4}-\d{2}-\d{2}-[a-z0-9-]+$/;
const MAX_BODY = 100_000;

const slugify = (s) =>
  s
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'post';

const oneLine = (s, max) => String(s ?? '').replace(/[\r\n]+/g, ' ').trim().slice(0, max);
const idList = (v) => (Array.isArray(v) ? v : []).map((x) => String(x).trim()).filter(Boolean);

function summarize({ slug, text, sha }) {
  try {
    const { data } = frontmatter.parse(text, slug);
    return { slug, sha, title: data.title || slug, date: data.date || slug.slice(0, 10), draft: data.draft === true };
  } catch {
    return { slug, sha, title: slug, date: slug.slice(0, 10), draft: false, broken: true };
  }
}

// The editor's view of a stored post.
function toFields(text, slug) {
  const { data, body } = frontmatter.parse(text, slug);
  return {
    title: data.title || '',
    date: data.date || slug.slice(0, 10),
    summary: data.summary || '',
    tags: [].concat(data.tags || []),
    projects: [].concat(data.projects || []),
    certs: [].concat(data.certs || []),
    draft: data.draft === true,
    body: body.replace(/^\n+/, ''),
  };
}

// Turns the editor's fields into a validated post, or throws a 400.
function toPost(input) {
  const bad = (msg) => Object.assign(new Error(msg), { status: 400 });
  const title = oneLine(input.title, 200);
  const date = String(input.date || '');
  const body = String(input.body ?? '');
  if (!title) throw bad('Title is required');
  if (!DATE_RE.test(date) || Number.isNaN(Date.parse(date))) throw bad('Date must be YYYY-MM-DD');
  if (body.length > MAX_BODY) throw bad('Post is too long');

  const knownProjects = new Set(projects.map((p) => p.id));
  const knownCerts = new Set(certs.map((c) => c.id));
  const postProjects = idList(input.projects);
  const postCerts = idList(input.certs);
  const unknown = [...postProjects.filter((id) => !knownProjects.has(id)), ...postCerts.filter((id) => !knownCerts.has(id))];
  if (unknown.length) throw bad(`Unknown project or certification: ${unknown.join(', ')}`);

  const tags = [...new Set(idList(input.tags).map((t) => t.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '')).filter(Boolean))];

  const data = {
    title,
    date,
    summary: oneLine(input.summary, 300),
    tags,
    projects: postProjects,
    certs: postCerts,
    draft: input.draft === true,
  };
  return { data, text: frontmatter.stringify(data, body) };
}

// GET    /api/posts              → { posts, projects, certs, storage }
// GET    /api/posts?slug=…       → { slug, sha, fields }
// PUT    /api/posts  { slug?, sha?, title, date, summary, tags, projects, certs, draft, body }
// DELETE /api/posts  { slug, sha }
module.exports = async function handler(req, res) {
  const mutation = req.method === 'PUT' || req.method === 'DELETE';
  if (!auth.guard(req, res, { mutation })) return;

  try {
    const store = getStore();

    if (req.method === 'GET' && req.query.slug) {
      if (!SLUG_RE.test(req.query.slug)) return res.status(400).json({ error: 'Bad slug' });
      const post = await store.get(req.query.slug);
      return res.status(200).json({ slug: post.slug, sha: post.sha, fields: toFields(post.text, post.slug) });
    }

    if (req.method === 'GET') {
      const posts = (await store.list()).map(summarize).sort((a, b) => b.date.localeCompare(a.date) || b.slug.localeCompare(a.slug));
      return res.status(200).json({
        posts,
        projects: projects.map(({ id, name, status }) => ({ id, name, status })),
        certs: certs.map(({ id, name }) => ({ id, name })),
        storage: store.kind,
      });
    }

    if (req.method === 'PUT') {
      const input = req.body || {};
      const { data, text } = toPost(input);
      // Existing posts keep their slug (and URL) even if the title changes.
      let slug = input.slug;
      if (slug) {
        if (!SLUG_RE.test(slug)) return res.status(400).json({ error: 'Bad slug' });
      } else {
        const taken = new Set((await store.list()).map((p) => p.slug));
        const base = `${data.date}-${slugify(data.title)}`;
        slug = base;
        for (let n = 2; taken.has(slug); n++) slug = `${base}-${n}`;
      }
      const { sha } = await store.put(slug, text, slug === input.slug ? input.sha : null);
      return res.status(200).json({ slug, sha, storage: store.kind, fields: toFields(text, slug) });
    }

    if (req.method === 'DELETE') {
      const { slug, sha } = req.body || {};
      if (!SLUG_RE.test(slug || '') || !sha) return res.status(400).json({ error: 'slug and sha are required' });
      await store.remove(slug, sha);
      return res.status(200).json({ deleted: slug });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    if (!err.status || err.status >= 500) console.error('posts API error:', err);
    // Only the logged-in admin reaches this, so the real message is safe to show.
    return res.status(err.status || 500).json({ error: err.message || 'Server error' });
  }
};
