// Theme toggle
document.querySelector('.theme-toggle')?.addEventListener('click', () => {
  const next = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', next);
  try {
    localStorage.setItem('theme', next);
  } catch (e) {}
});

// Mobile menu
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.getElementById('nav-links');
navToggle?.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(open));
});
navLinks?.addEventListener('click', (e) => {
  if (e.target.closest('a')) {
    navLinks.classList.remove('open');
    navToggle?.setAttribute('aria-expanded', 'false');
  }
});

// Contact form. GitHub Pages can't run the /api/contact function, so from
// any host other than Vercel or localhost we post to the Vercel deployment.
const form = document.getElementById('contact-form');
if (form) {
  const status = form.querySelector('.form-status');
  const button = form.querySelector('button[type="submit"]');
  const remote = form.dataset.endpoint;
  const local = ['localhost', '127.0.0.1'].includes(location.hostname) || location.hostname.endsWith('.vercel.app');
  const endpoint = local || !remote ? 'api/contact' : remote;

  const setStatus = (text, kind) => {
    status.textContent = text;
    status.className = `form-status ${kind || ''}`;
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    const data = Object.fromEntries(new FormData(form));
    button.disabled = true;
    setStatus('Sending…');
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok || !result.success) throw new Error(result.message || `HTTP ${res.status}`);
      form.reset();
      setStatus("Thanks! Your message was sent and I'll get back to you soon.", 'ok');
    } catch (err) {
      console.error('Contact form error:', err);
      setStatus("Sorry, that didn't send. Please reach out on LinkedIn instead.", 'err');
    } finally {
      button.disabled = false;
    }
  });
}

// Activity grid: on narrow screens start scrolled to the most recent weeks
const grid = document.querySelector('.activity-grid');
if (grid) grid.scrollLeft = grid.scrollWidth;

// Blog filters: ?project=, ?cert=, ?tag= and free-text search
const filters = document.getElementById('log-filters');
if (filters) {
  const rows = [...document.querySelectorAll('.log-row')];
  const months = [...document.querySelectorAll('.log-month')];
  const search = document.getElementById('log-search');
  const empty = document.getElementById('log-empty');
  const buttons = [...filters.querySelectorAll('button.filter')];
  const params = new URLSearchParams(location.search);
  let active = null;
  for (const kind of ['project', 'cert', 'tag']) {
    if (params.has(kind)) active = { kind, value: params.get(kind) };
  }

  const apply = () => {
    const q = search.value.trim().toLowerCase();
    let shown = 0;
    for (const row of rows) {
      const matchFilter = !active || row.dataset[`${active.kind}s`].split(' ').includes(active.value);
      const matchSearch = !q || row.dataset.search.includes(q);
      row.hidden = !(matchFilter && matchSearch);
      if (!row.hidden) shown++;
    }
    for (const m of months) m.hidden = !m.querySelector('.log-row:not([hidden])');
    empty.hidden = shown > 0;
    for (const b of buttons) {
      b.setAttribute('aria-pressed', String(!!active && b.dataset.kind === active.kind && b.dataset.value === active.value));
    }
    const url = new URL(location.href);
    url.search = active ? `?${active.kind}=${encodeURIComponent(active.value)}` : '';
    history.replaceState(null, '', url);
  };

  for (const b of buttons) {
    b.addEventListener('click', () => {
      const same = active && active.kind === b.dataset.kind && active.value === b.dataset.value;
      active = same ? null : { kind: b.dataset.kind, value: b.dataset.value };
      apply();
    });
  }
  search.addEventListener('input', apply);
  apply();
}
