#!/usr/bin/env node
// Generates the static site in dist/ from content/ and public/:
//   index.html               home page (projects, certifications, latest log entries)
//   blog/index.html          the log, with filters and an activity grid
//   blog/<slug>/index.html   one page per post
//   blog/feed.xml            RSS
//   admin/index.html         the in-browser post editor (needs the Vercel API)
//   + everything in public/  (styles, scripts)
//
// Usage:
//   node scripts/build.js            build once
//   node scripts/build.js --watch    rebuild when content/, src/ or public/ changes
//   node scripts/build.js --serve    watch + run the local server (npm run dev)

const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
const frontmatter = require('../src/frontmatter');

const ROOT = path.join(__dirname, '..');
const CONTENT = path.join(ROOT, 'content');
const POSTS_DIR = path.join(CONTENT, 'posts');
const PUBLIC = path.join(ROOT, 'public');
const OUT = path.join(ROOT, 'dist');
const ACTIVITY_WEEKS = 26;

const readJSON = (file) => JSON.parse(fs.readFileSync(path.join(CONTENT, file), 'utf8'));

function loadPosts(projectsById, certsById) {
  if (!fs.existsSync(POSTS_DIR)) return [];
  const posts = [];
  for (const file of fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith('.md'))) {
    const { data, body } = frontmatter.parse(fs.readFileSync(path.join(POSTS_DIR, file), 'utf8'), file);
    if (data.draft === true) continue;

    const slug = file.replace(/\.md$/, '');
    const date = data.date || (slug.match(/^\d{4}-\d{2}-\d{2}/) || [])[0];
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date || '')) throw new Error(`${file}: needs "date: YYYY-MM-DD"`);
    if (!data.title) throw new Error(`${file}: needs a "title:"`);

    const asList = (v) => (Array.isArray(v) ? v : v ? [v] : []);
    const lookup = (ids, table, kind) =>
      ids.map((id) => {
        if (!table.has(id)) {
          throw new Error(`${file}: unknown ${kind} "${id}". Known ${kind}s: ${[...table.keys()].join(', ') || '(none)'}`);
        }
        return table.get(id);
      });

    const projects = asList(data.projects);
    const certs = asList(data.certs);
    const words = body.split(/\s+/).filter(Boolean).length;
    posts.push({
      slug,
      date,
      title: data.title,
      summary: data.summary || '',
      tags: asList(data.tags).map((t) => t.toLowerCase()),
      projects,
      certs,
      projectRefs: lookup(projects, projectsById, 'project'),
      certRefs: lookup(certs, certsById, 'cert'),
      readingTime: Math.max(1, Math.round(words / 200)),
      html: marked.parse(body),
    });
  }
  return posts.sort((a, b) => b.date.localeCompare(a.date) || b.slug.localeCompare(a.slug));
}

// Day-by-day post counts for the last ACTIVITY_WEEKS weeks, starting on a
// Sunday so the grid's rows line up with weekdays.
function buildActivity(posts, today = new Date()) {
  const dayMs = 86400000;
  const iso = (t) => new Date(t).toISOString().slice(0, 10);
  const end = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  const start = end - ((ACTIVITY_WEEKS - 1) * 7 + new Date(end).getUTCDay()) * dayMs;

  const byDay = new Map();
  for (const p of posts) {
    if (!byDay.has(p.date)) byDay.set(p.date, []);
    byDay.get(p.date).push(p);
  }

  const days = [];
  for (let t = start; t <= end; t += dayMs) {
    const date = iso(t);
    const list = byDay.get(date) || [];
    // posts are newest-first, so the last one is the day's first entry
    days.push({ date, count: list.length, slug: list.length ? list[list.length - 1].slug : null });
  }

  const logged = [...byDay.keys()].sort();
  let longest = 0;
  let run = 0;
  for (let i = 0; i < logged.length; i++) {
    const prev = i && Date.parse(logged[i - 1] + 'T00:00:00Z');
    run = prev && Date.parse(logged[i] + 'T00:00:00Z') - prev === dayMs ? run + 1 : 1;
    longest = Math.max(longest, run);
  }

  return { days, weeks: ACTIVITY_WEEKS, total: posts.length, daysLogged: logged.length, longestStreak: longest };
}

function write(rel, contents) {
  const file = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, contents);
}

function build() {
  // Re-require templates so --watch picks up edits to src/templates.js.
  delete require.cache[require.resolve('../src/templates')];
  const t = require('../src/templates');

  const site = readJSON('site.json');
  if (!site.url.endsWith('/')) site.url += '/';
  const projects = readJSON('projects.json');
  const certs = readJSON('certifications.json');
  const projectsById = new Map(projects.map((p) => [p.id, p]));
  const certsById = new Map(certs.map((c) => [c.id, c]));

  const posts = loadPosts(projectsById, certsById);
  for (const p of projects) p.postCount = posts.filter((post) => post.projects.includes(p.id)).length;
  for (const c of certs) c.postCount = posts.filter((post) => post.certs.includes(c.id)).length;

  fs.rmSync(OUT, { recursive: true, force: true });
  fs.cpSync(PUBLIC, OUT, { recursive: true });
  write('index.html', t.homePage({ site, projects, certs, posts }));
  write('blog/index.html', t.blogIndexPage({ site, posts, projects, certs, activity: buildActivity(posts) }));
  posts.forEach((post, i) => {
    write(`blog/${post.slug}/index.html`, t.postPage({ site, post, prev: posts[i + 1], next: posts[i - 1], certs }));
  });
  write('blog/feed.xml', t.feed({ site, posts }));
  write('admin/index.html', t.adminPage({ site, hasCerts: certs.length > 0 }));

  console.log(`Built home + ${posts.length} log ${posts.length === 1 ? 'entry' : 'entries'}.`);
}

function watch() {
  let timer = null;
  const rebuild = () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      try {
        build();
      } catch (err) {
        console.error('Build failed:', err.message);
      }
    }, 100);
  };
  for (const dir of [CONTENT, PUBLIC, path.join(ROOT, 'src')]) fs.watch(dir, { recursive: true }, rebuild);
  console.log('Watching content/, src/ and public/ for changes…');
}

if (require.main === module) {
  const args = process.argv.slice(2);
  try {
    build();
  } catch (err) {
    console.error('Build failed:', err.message);
    if (!args.includes('--watch') && !args.includes('--serve')) process.exit(1);
  }
  if (args.includes('--watch') || args.includes('--serve')) watch();
  if (args.includes('--serve')) require('../server');
}

module.exports = { build, buildActivity };
