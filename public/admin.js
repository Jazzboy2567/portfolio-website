// Blog editor: log in, then write or edit posts. Saving goes through
// /api/posts, which commits the Markdown file to the repo; the site rebuilds
// from there.
(function () {
  const root = document.getElementById('admin');
  if (!root) return;

  // The API only exists on Vercel. Send the GitHub Pages copy there.
  if (location.hostname.endsWith('github.io')) {
    const url = root.dataset.adminUrl;
    root.innerHTML = `<p class="admin-msg">The editor runs on the Vercel copy of this site. Taking you to <a href="${url}">${url}</a>…</p>`;
    location.replace(url);
    return;
  }

  const $ = (id) => document.getElementById(id);
  const loading = $('admin-loading');
  const loginForm = $('login-form');
  const app = $('admin-app');
  const editor = $('editor');
  const list = $('post-list');
  const status = $('editor-status');
  const f = editor.elements;

  const TEMPLATE = '## What I worked on\n\n- \n\n## What I learned\n\n- \n\n## Next up\n\n- \n';
  const pad = (n) => String(n).padStart(2, '0');
  const today = () => {
    const d = new Date();
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };
  const escapeHtml = (s) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

  let meta = { posts: [], projects: [], certs: [], storage: 'local' };
  let current = { slug: null, sha: null, draft: false };
  let savedSnapshot = '';

  // ---------------------------------------------------------------- api

  async function api(method, url, body) {
    const res = await fetch(url, {
      method,
      credentials: 'same-origin',
      headers: body ? { 'Content-Type': 'application/json' } : {},
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (res.status === 401 && url !== '/api/login') {
      showLogin('Your session expired. Log in again.');
      throw new Error('Not logged in');
    }
    if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
    return data;
  }

  function setStatus(el, text, kind) {
    el.textContent = text;
    el.className = `form-status ${kind || ''}`;
  }

  // ---------------------------------------------------------------- views

  function showLogin(message) {
    loading.hidden = true;
    app.hidden = true;
    loginForm.hidden = false;
    setStatus($('login-status'), message || '', message ? 'err' : '');
    loginForm.elements.password.focus();
  }

  async function showApp() {
    loading.hidden = true;
    loginForm.hidden = true;
    app.hidden = false;
    await refreshList();
    renderPicks();
    await openToday();
  }

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = loginForm.querySelector('button');
    btn.disabled = true;
    setStatus($('login-status'), 'Checking…');
    try {
      await api('POST', '/api/login', { password: loginForm.elements.password.value });
      loginForm.reset();
      await showApp();
    } catch (err) {
      setStatus($('login-status'), err.message, 'err');
    } finally {
      btn.disabled = false;
    }
  });

  $('logout-btn').addEventListener('click', async () => {
    if (!confirmDiscard()) return;
    await api('DELETE', '/api/login').catch(() => {});
    savedSnapshot = snapshot();
    showLogin();
  });

  // ---------------------------------------------------------------- list

  async function refreshList() {
    meta = await api('GET', '/api/posts');
    $('post-count').textContent = meta.posts.length ? `(${meta.posts.length})` : '';
    $('post-search').hidden = meta.posts.length < 2;
    renderList();
  }

  function renderList() {
    const q = $('post-search').value.trim().toLowerCase();
    const posts = meta.posts.filter((p) => !q || [p.title, p.summary, ...p.tags].join(' ').toLowerCase().includes(q));
    list.innerHTML = posts.length
      ? posts
          .map(
            (p) => `<li class="admin-post${p.slug === current.slug ? ' current' : ''}" data-slug="${escapeHtml(p.slug)}">
              <div class="admin-post-meta">
                <span class="mono muted">${escapeHtml(p.date)}</span>
                <span class="status ${p.draft ? 'status-shipped' : 'status-active'}">${p.draft ? 'Draft' : 'Published'}</span>
              </div>
              <strong>${escapeHtml(p.title)}</strong>
              ${p.summary ? `<span class="muted admin-post-summary">${escapeHtml(p.summary)}</span>` : ''}
              ${p.tags.length ? `<div class="chip-row">${p.tags.map((t) => `<span class="chip chip-tag">#${escapeHtml(t)}</span>`).join('')}</div>` : ''}
              <div class="admin-post-actions">
                <button type="button" class="btn btn-small" data-edit="${escapeHtml(p.slug)}">Edit</button>
                ${p.draft ? '' : `<a class="btn btn-small" href="../blog/${encodeURIComponent(p.slug)}/" target="_blank" rel="noopener">View ↗</a>`}
              </div>
            </li>`
          )
          .join('')
      : `<li class="muted admin-empty">${q ? 'No posts match.' : 'No posts yet. Click “Today’s post” to write your first one.'}</li>`;
  }

  $('post-search').addEventListener('input', renderList);

  list.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-edit]');
    if (btn && confirmDiscard()) {
      openPost(btn.dataset.edit);
      editor.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  function renderPicks() {
    const pick = (kind, items, selected = []) =>
      items
        .map(
          (x) => `<label class="pick"><input type="checkbox" name="${kind}" value="${escapeHtml(x.id)}"${selected.includes(x.id) ? ' checked' : ''}><span class="chip chip-${kind === 'projects' ? 'project' : 'cert'}">${escapeHtml(x.name)}</span></label>`
        )
        .join('');
    $('project-picks').innerHTML = pick('projects', meta.projects);
    $('cert-picks').innerHTML = pick('certs', meta.certs);
    $('cert-fieldset').hidden = meta.certs.length === 0;
  }

  // ---------------------------------------------------------------- editor

  function fill(slug, sha, fields) {
    current = { slug, sha, draft: fields.draft };
    f.title.value = fields.title;
    f.date.value = fields.date;
    f.summary.value = fields.summary;
    f.tags.value = fields.tags.join(', ');
    f.body.value = fields.body;
    for (const box of editor.querySelectorAll('input[name=projects]')) box.checked = fields.projects.includes(box.value);
    for (const box of editor.querySelectorAll('input[name=certs]')) box.checked = fields.certs.includes(box.value);
    $('editor-slug').textContent = slug ? `Editing: blog/${slug}/` : 'New post';
    $('editor-state').hidden = !(slug && fields.draft);
    $('delete-btn').hidden = !slug;
    f.date.disabled = !!slug; // the date is part of the URL once saved
    for (const li of list.querySelectorAll('li[data-slug]')) li.classList.toggle('current', li.dataset.slug === slug);
    showTab('write');
    savedSnapshot = snapshot();
    setStatus(status, '');
  }

  function newPost(date = today()) {
    fill(null, null, { title: '', date, summary: '', tags: [], projects: [], certs: [], draft: false, body: TEMPLATE });
    f.title.focus();
  }

  async function openPost(slug) {
    setStatus(status, 'Loading…');
    try {
      const post = await api('GET', `/api/posts?slug=${encodeURIComponent(slug)}`);
      fill(post.slug, post.sha, post.fields);
    } catch (err) {
      setStatus(status, err.message, 'err');
    }
  }

  async function openToday() {
    const existing = meta.posts.find((p) => p.date === today());
    if (existing) await openPost(existing.slug);
    else newPost();
  }

  $('today-btn').addEventListener('click', () => confirmDiscard() && openToday());
  $('new-btn').addEventListener('click', () => confirmDiscard() && newPost());

  function fields(draft) {
    const checked = (name) => [...editor.querySelectorAll(`input[name=${name}]:checked`)].map((b) => b.value);
    return {
      slug: current.slug,
      sha: current.sha,
      title: f.title.value,
      date: f.date.value,
      summary: f.summary.value,
      tags: f.tags.value.split(',').map((t) => t.trim()).filter(Boolean),
      projects: checked('projects'),
      certs: checked('certs'),
      draft,
      body: f.body.value,
    };
  }

  const snapshot = () => JSON.stringify(fields(current.draft));
  const isDirty = () => !app.hidden && snapshot() !== savedSnapshot;
  const confirmDiscard = () => !isDirty() || confirm('You have unsaved changes. Discard them?');
  window.addEventListener('beforeunload', (e) => {
    if (isDirty()) e.preventDefault();
  });

  async function save(draft) {
    if (!editor.reportValidity()) return;
    const buttons = editor.querySelectorAll('button');
    buttons.forEach((b) => (b.disabled = true));
    setStatus(status, draft ? 'Saving draft…' : 'Publishing…');
    try {
      const saved = await api('PUT', '/api/posts', fields(draft));
      current = { slug: saved.slug, sha: saved.sha, draft };
      await refreshList();
      fill(saved.slug, saved.sha, saved.fields);
      const when = meta.storage === 'github' ? ' The site updates in about a minute.' : ' Rebuilt locally.';
      setStatus(status, (draft ? 'Draft saved. It stays hidden from the site.' : 'Published!') + (draft ? '' : when), 'ok');
    } catch (err) {
      setStatus(status, err.message, 'err');
    } finally {
      buttons.forEach((b) => (b.disabled = false));
    }
  }

  editor.addEventListener('submit', (e) => {
    e.preventDefault();
    save(e.submitter?.dataset.draft === 'true');
  });

  // Ctrl/Cmd+S saves without changing draft/published state
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's' && !app.hidden) {
      e.preventDefault();
      save(current.slug ? current.draft : false);
    }
  });

  $('delete-btn').addEventListener('click', async () => {
    if (!current.slug || !confirm(`Delete "${f.title.value}"? This removes it from the site.`)) return;
    setStatus(status, 'Deleting…');
    try {
      await api('DELETE', '/api/posts', { slug: current.slug, sha: current.sha });
      current = { slug: null, sha: null, draft: false };
      await refreshList();
      newPost();
      setStatus(status, 'Deleted.', 'ok');
    } catch (err) {
      setStatus(status, err.message, 'err');
    }
  });

  // ---------------------------------------------------------------- preview

  function showTab(tab) {
    for (const b of editor.querySelectorAll('[data-tab]')) b.setAttribute('aria-selected', String(b.dataset.tab === tab));
    const preview = $('preview');
    f.body.hidden = tab !== 'write';
    preview.hidden = tab !== 'preview';
    if (tab === 'preview') {
      preview.innerHTML = window.marked ? window.marked.parse(f.body.value) : `<pre>${escapeHtml(f.body.value)}</pre>`;
    }
  }
  for (const b of editor.querySelectorAll('[data-tab]')) b.addEventListener('click', () => showTab(b.dataset.tab));

  // ---------------------------------------------------------------- start

  api('GET', '/api/login')
    .then((s) => {
      if (s.configError) {
        loading.textContent = `The editor isn't set up yet: ${s.configError}. See the README.`;
      } else if (s.authenticated) {
        showApp().catch((err) => (loading.textContent = err.message));
      } else {
        showLogin();
      }
    })
    .catch(() => {
      loading.textContent = "Couldn't reach the editor API. Run npm run dev locally, or use the Vercel site.";
    });
})();
