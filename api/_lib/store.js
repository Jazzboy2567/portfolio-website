// Where posts live. In production each save is a commit to content/posts/ in
// the GitHub repo (GITHUB_TOKEN), which triggers the Vercel and GitHub Pages
// rebuilds. Without a token (local dev) posts are read and written on disk
// and `npm run dev` rebuilds on change.
//
// Every post has a version string (`sha`). Saves pass back the version they
// loaded, so an edit made elsewhere in the meantime is rejected, not overwritten.

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const POSTS_PATH = 'content/posts';

class ConflictError extends Error {
  constructor() {
    super('This post was changed somewhere else since you opened it. Reload it and try again.');
    this.status = 409;
  }
}

class NotFoundError extends Error {
  constructor() {
    super('Post not found');
    this.status = 404;
  }
}

// ------------------------------------------------------------------ local disk

function localStore(root = path.join(__dirname, '..', '..')) {
  const dir = path.join(root, POSTS_PATH);
  const file = (slug) => path.join(dir, `${slug}.md`);
  const version = (text) => crypto.createHash('sha1').update(text).digest('hex');
  const read = (slug) => {
    try {
      return fs.readFileSync(file(slug), 'utf8');
    } catch {
      return null;
    }
  };

  return {
    kind: 'local',
    async list() {
      if (!fs.existsSync(dir)) return [];
      return fs
        .readdirSync(dir)
        .filter((f) => f.endsWith('.md'))
        .map((f) => {
          const text = fs.readFileSync(path.join(dir, f), 'utf8');
          return { slug: f.slice(0, -3), text, sha: version(text) };
        });
    },
    async get(slug) {
      const text = read(slug);
      if (text === null) throw new NotFoundError();
      return { slug, text, sha: version(text) };
    },
    async put(slug, text, sha) {
      const current = read(slug);
      if ((current === null) !== !sha || (current !== null && version(current) !== sha)) throw new ConflictError();
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(file(slug), text);
      return { sha: version(text) };
    },
    async remove(slug, sha) {
      const current = read(slug);
      if (current === null) throw new NotFoundError();
      if (version(current) !== sha) throw new ConflictError();
      fs.unlinkSync(file(slug));
    },
  };
}

// ------------------------------------------------------------------ GitHub

function githubStore({ token, repo, branch, fetch = globalThis.fetch }) {
  const [owner, name] = repo.split('/');
  const api = async (method, url, body) => {
    const res = await fetch(`https://api.github.com${url}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'portfolio-admin',
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (res.status === 404) throw new NotFoundError();
    if (res.status === 409 || res.status === 422) throw new ConflictError();
    if (!res.ok) throw new Error(`GitHub API ${res.status}: ${data.message || 'request failed'}`);
    if (data.errors?.length) throw new Error(`GitHub API: ${data.errors[0].message}`);
    return data;
  };
  const contentsUrl = (slug) => `/repos/${owner}/${name}/contents/${POSTS_PATH}/${encodeURIComponent(slug)}.md`;

  return {
    kind: 'github',
    // One GraphQL call returns every post's text instead of one request per file.
    async list() {
      const data = await api('POST', '/graphql', {
        query: `query($owner: String!, $name: String!, $expr: String!) {
          repository(owner: $owner, name: $name) {
            object(expression: $expr) { ... on Tree { entries { name object { ... on Blob { oid text } } } } }
          }
        }`,
        variables: { owner, name, expr: `${branch}:${POSTS_PATH}` },
      });
      const entries = data.data?.repository?.object?.entries || [];
      return entries
        .filter((e) => e.name.endsWith('.md') && e.object)
        .map((e) => ({ slug: e.name.slice(0, -3), text: e.object.text, sha: e.object.oid }));
    },
    async get(slug) {
      const data = await api('GET', `${contentsUrl(slug)}?ref=${encodeURIComponent(branch)}`);
      return { slug, text: Buffer.from(data.content, 'base64').toString('utf8'), sha: data.sha };
    },
    async put(slug, text, sha) {
      const data = await api('PUT', contentsUrl(slug), {
        message: `log: ${sha ? 'update' : 'add'} ${slug}`,
        content: Buffer.from(text, 'utf8').toString('base64'),
        branch,
        ...(sha ? { sha } : {}),
      });
      return { sha: data.content.sha };
    },
    async remove(slug, sha) {
      await api('DELETE', contentsUrl(slug), { message: `log: delete ${slug}`, sha, branch });
    },
  };
}

function getStore() {
  if (process.env.GITHUB_TOKEN) {
    return githubStore({
      token: process.env.GITHUB_TOKEN,
      repo: process.env.GITHUB_REPO || 'Jazzboy2567/portfolio-website',
      branch: process.env.GITHUB_BRANCH || 'main',
    });
  }
  if (process.env.VERCEL) {
    throw Object.assign(new Error('GITHUB_TOKEN is not set, so posts cannot be saved on Vercel.'), { status: 500 });
  }
  return localStore();
}

module.exports = { getStore, localStore, githubStore, ConflictError, NotFoundError };
