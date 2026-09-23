// HTML templates for every generated page. Each page receives `root`, the
// relative path back to the site root ('' for home, '../' for /blog/, '../../'
// for a post), so links work both on GitHub Pages (served under
// /portfolio-website/) and on Vercel (served at /).

const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const fmtDate = (iso) => {
  const [y, m, d] = iso.split('-').map(Number);
  return d ? `${MONTHS[m - 1]} ${d}, ${y}` : `${MONTHS[m - 1]} ${y}`;
};
const fmtMonth = (iso) => {
  const [y, m] = iso.split('-').map(Number);
  return `${['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][m - 1]} ${y}`;
};

const icon = {
  github: '<svg viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>',
  linkedin: '<svg viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M0 1.15C0 .52.52 0 1.18 0h13.64C15.48 0 16 .52 16 1.15v13.7c0 .63-.52 1.15-1.18 1.15H1.18C.52 16 0 15.48 0 14.85V1.15zm4.94 12.23V6.17H2.542v7.21h2.4zM3.74 5.18c.84 0 1.36-.55 1.36-1.25-.01-.71-.52-1.25-1.34-1.25-.82 0-1.36.54-1.36 1.25 0 .7.52 1.25 1.33 1.25h.01zm4.91 8.2V9.35c0-.21.02-.43.08-.58.17-.43.57-.88 1.23-.88.87 0 1.22.66 1.22 1.63v3.86h2.4V9.25c0-2.22-1.18-3.25-2.76-3.25-1.27 0-1.84.7-2.16 1.19v.03h-.02l.02-.03V6.17h-2.4c.03.68 0 7.21 0 7.21h2.4z"/></svg>',
  rss: '<svg viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M2 2.75A.75.75 0 012.75 2C8.963 2 14 7.037 14 13.25a.75.75 0 01-1.5 0A9.75 9.75 0 002.75 3.5.75.75 0 012 2.75zm0 4.5a.75.75 0 01.75-.75 6.75 6.75 0 016.75 6.75.75.75 0 01-1.5 0C8 10.35 5.65 8 2.75 8A.75.75 0 012 7.25zM3.5 11a1.5 1.5 0 110 3 1.5 1.5 0 010-3z"/></svg>',
  lock: '<svg viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M4 4a4 4 0 018 0v2h.25c.97 0 1.75.78 1.75 1.75v5.5A1.75 1.75 0 0112.25 15h-8.5A1.75 1.75 0 012 13.25v-5.5C2 6.78 2.78 6 3.75 6H4V4zm6.5 2V4a2.5 2.5 0 10-5 0v2h5z"/></svg>',
  arrow: '<svg viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M8.22 2.97a.75.75 0 011.06 0l4.25 4.25a.75.75 0 010 1.06l-4.25 4.25a.75.75 0 01-1.06-1.06l2.97-2.97H3.75a.75.75 0 010-1.5h7.44L8.22 4.03a.75.75 0 010-1.06z"/></svg>',
  sun: '<svg class="icon-sun" viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M8 12a4 4 0 110-8 4 4 0 010 8zm0-1.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM8 0a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0V.75A.75.75 0 018 0zm0 13a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 018 13zM2.34 2.34a.75.75 0 011.06 0l1.06 1.06a.75.75 0 01-1.06 1.06L2.34 3.4a.75.75 0 010-1.06zm9.2 9.2a.75.75 0 011.06 0l1.06 1.06a.75.75 0 11-1.06 1.06l-1.06-1.06a.75.75 0 010-1.06zM0 8a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5H.75A.75.75 0 010 8zm13 0a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5h-1.5A.75.75 0 0113 8zM2.34 13.66a.75.75 0 010-1.06l1.06-1.06a.75.75 0 111.06 1.06L3.4 13.66a.75.75 0 01-1.06 0zm9.2-9.2a.75.75 0 010-1.06l1.06-1.06a.75.75 0 111.06 1.06l-1.06 1.06a.75.75 0 01-1.06 0z"/></svg>',
  moon: '<svg class="icon-moon" viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M6 .278a.77.77 0 0 1 .08.858 7.2 7.2 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277q.792-.001 1.533-.16a.79.79 0 0 1 .81.316.73.73 0 0 1-.031.893A8.35 8.35 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.75.75 0 0 1 6 .278"/></svg>',
  menu: '<svg viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M1 2.75A.75.75 0 011.75 2h12.5a.75.75 0 010 1.5H1.75A.75.75 0 011 2.75zm0 5A.75.75 0 011.75 7h12.5a.75.75 0 010 1.5H1.75A.75.75 0 011 7.75zM1.75 12h12.5a.75.75 0 010 1.5H1.75a.75.75 0 010-1.5z"/></svg>',
};

const chips = (items, cls = 'chip') => items.map((s) => `<span class="${cls}">${esc(s)}</span>`).join('');
const plural = (n, one, many = one + 's') => `${n} ${n === 1 ? one : many}`;

// ---------------------------------------------------------------- layout

function layout({ site, root, active, title, description, canonical, body, hasCerts, head = '', scripts = '' }) {
  const nav = [
    ['projects', `${root}#projects`, 'Projects'],
    ...(hasCerts ? [['certifications', `${root}#certifications`, 'Certifications']] : []),
    ['log', `${root}blog/`, 'Log'],
    ['about', `${root}#about`, 'About'],
    ['contact', `${root}#contact`, 'Contact'],
  ];
  return `<!DOCTYPE html>
<!-- Generated by scripts/build.js. Edit content/ and src/, then run: npm run build -->
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:type" content="website">
  ${canonical ? `<link rel="canonical" href="${esc(canonical)}">` : ''}
  <link rel="alternate" type="application/rss+xml" title="${esc(site.name)}: Log" href="${root}blog/feed.xml">
  <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='7' fill='%234f9cff'/%3E%3Ctext x='16' y='22' font-family='monospace' font-size='15' font-weight='700' text-anchor='middle' fill='%230e1117'%3Emn%3C/text%3E%3C/svg%3E">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <script src="${root}theme.js"></script>
  <link rel="stylesheet" href="${root}styles.css">
  ${head}
</head>
<body>
  <a class="skip-link" href="#main">Skip to content</a>
  <header class="site-header">
    <nav class="nav container" aria-label="Main">
      <a href="${root || './'}" class="brand"><span class="brand-mark">mn</span><span class="brand-name">${esc(site.name)}</span></a>
      <button class="icon-btn nav-toggle" type="button" aria-expanded="false" aria-controls="nav-links" aria-label="Menu">${icon.menu}</button>
      <ul class="nav-links" id="nav-links">
        ${nav.map(([key, href, label]) => `<li><a href="${href}"${key === active ? ' aria-current="page"' : ''}>${label}</a></li>`).join('\n        ')}
      </ul>
      <button class="icon-btn theme-toggle" type="button" aria-label="Toggle color theme">${icon.sun}${icon.moon}</button>
    </nav>
  </header>

  <main id="main">
${body}
  </main>

  <footer class="site-footer">
    <div class="container footer-inner">
      <span>&copy; ${new Date().getFullYear()} ${esc(site.name)}</span>
      <span class="footer-links">
        <a href="${esc(site.links.github)}" rel="me noopener" target="_blank">${icon.github}<span>GitHub</span></a>
        <a href="${esc(site.links.linkedin)}" rel="me noopener" target="_blank">${icon.linkedin}<span>LinkedIn</span></a>
        <a href="${root}blog/feed.xml">${icon.rss}<span>RSS</span></a>
      </span>
    </div>
  </footer>

  <script src="${root}script.js"></script>
  ${scripts}
</body>
</html>
`;
}

// ---------------------------------------------------------------- shared bits

function postRow(post, root, { showChips = true } = {}) {
  return `<li class="log-row" data-tags="${esc(post.tags.join(' '))}" data-projects="${esc(post.projects.join(' '))}" data-certs="${esc(post.certs.join(' '))}" data-search="${esc((post.title + ' ' + post.summary).toLowerCase())}">
          <time class="mono" datetime="${post.date}">${fmtDate(post.date)}</time>
          <div class="log-row-body">
            <a class="log-row-title" href="${root}blog/${post.slug}/">${esc(post.title)}</a>
            ${post.summary ? `<p>${esc(post.summary)}</p>` : ''}
            ${showChips ? postChips(post, root) : ''}
          </div>
        </li>`;
}

function postChips(post, root) {
  const parts = [];
  for (const p of post.projectRefs || []) parts.push(`<a class="chip chip-project" href="${root}blog/?project=${p.id}">${esc(p.name)}</a>`);
  for (const c of post.certRefs || []) parts.push(`<a class="chip chip-cert" href="${root}blog/?cert=${c.id}">${esc(c.name)}</a>`);
  for (const t of post.tags) parts.push(`<a class="chip chip-tag" href="${root}blog/?tag=${encodeURIComponent(t)}">#${esc(t)}</a>`);
  return parts.length ? `<div class="chip-row">${parts.join('')}</div>` : '';
}

function activityGrid(activity, root) {
  const cells = activity.days
    .map((d) => {
      const label = d.count ? `${plural(d.count, 'entry', 'entries')} on ${fmtDate(d.date)}` : `No entries on ${fmtDate(d.date)}`;
      const lvl = Math.min(d.count, 3);
      return d.count
        ? `<a class="cell l${lvl}" href="${root}blog/${d.slug}/" title="${label}" aria-label="${label}"></a>`
        : `<span class="cell" title="${label}"></span>`;
    })
    .join('');
  return `<div class="activity">
          <div class="activity-grid" style="--weeks:${activity.weeks}">${cells}</div>
          <dl class="activity-stats">
            <div><dt>Entries</dt><dd>${activity.total}</dd></div>
            <div><dt>Days logged</dt><dd>${activity.daysLogged}</dd></div>
            <div><dt>Longest streak</dt><dd>${plural(activity.longestStreak, 'day')}</dd></div>
          </dl>
        </div>`;
}

// ---------------------------------------------------------------- home

function projectCard(p, root) {
  const repo = p.repo
    ? `<a class="card-link" href="${esc(p.repo)}" target="_blank" rel="noopener">${icon.github}<span>Source</span></a>`
    : `<span class="card-link muted" title="Source is private">${icon.lock}<span>Private repo</span></span>`;
  const logs = p.postCount
    ? `<a class="card-link" href="${root}blog/?project=${p.id}">${plural(p.postCount, 'log entry', 'log entries')} ${icon.arrow}</a>`
    : '';
  return `<article class="card project" id="project-${p.id}">
            <header class="card-head">
              <h3>${esc(p.name)}</h3>
              <span class="status status-${esc(p.status)}">${p.status === 'active' ? 'Active' : 'Shipped'}</span>
            </header>
            <p class="card-summary">${esc(p.summary)}</p>
            ${p.highlights?.length ? `<ul class="highlights">${p.highlights.map((h) => `<li>${esc(h)}</li>`).join('')}</ul>` : ''}
            <div class="chip-row">${chips(p.stack)}</div>
            <footer class="card-foot">${repo}${logs}</footer>
          </article>`;
}

function certCard(c, root) {
  const earned = c.status !== 'in-progress';
  return `<article class="card cert" id="cert-${c.id}">
            <header class="card-head">
              <h3>${esc(c.name)}</h3>
              <span class="status ${earned ? 'status-shipped' : 'status-active'}">${earned ? 'Earned' : 'In progress'}</span>
            </header>
            <p class="cert-meta mono">${esc(c.issuer)}${c.date ? ` · ${fmtDate(c.date)}` : ''}</p>
            ${c.skills?.length ? `<div class="chip-row">${chips(c.skills)}</div>` : ''}
            <footer class="card-foot">
              ${c.url ? `<a class="card-link" href="${esc(c.url)}" target="_blank" rel="noopener">Verify credential ${icon.arrow}</a>` : ''}
              ${c.postCount ? `<a class="card-link" href="${root}blog/?cert=${c.id}">${plural(c.postCount, 'log entry', 'log entries')} ${icon.arrow}</a>` : ''}
            </footer>
          </article>`;
}

function homePage({ site, projects, certs, posts }) {
  const root = '';
  const featured = projects.filter((p) => p.featured);
  const earlier = projects.filter((p) => !p.featured);
  const building = projects.filter((p) => p.status === 'active' && p.featured).slice(0, 4);
  const latest = posts.slice(0, 3);

  const body = `
    <section class="hero container">
      <div class="hero-text">
        <p class="eyebrow mono"><span class="prompt">$</span> whoami</p>
        <h1>${esc(site.name)}</h1>
        <p class="hero-role">${esc(site.role)} <span class="dot-sep">·</span> ${esc(site.location)}</p>
        <p class="hero-tagline">${esc(site.tagline)}</p>
        <div class="hero-actions">
          <a class="btn btn-primary" href="#projects">See projects</a>
          <a class="btn" href="blog/">Read the log</a>
          <span class="hero-icons">
            <a class="icon-btn" href="${esc(site.links.github)}" target="_blank" rel="me noopener" aria-label="GitHub">${icon.github}</a>
            <a class="icon-btn" href="${esc(site.links.linkedin)}" target="_blank" rel="me noopener" aria-label="LinkedIn">${icon.linkedin}</a>
          </span>
        </div>
      </div>
      <aside class="panel now-panel" aria-label="What I'm working on">
        <div class="panel-bar"><span class="mono">now.md</span></div>
        <div class="panel-body">
          <h2 class="panel-label">Currently building</h2>
          <ul class="now-list">
            ${building.map((p) => `<li><a href="#project-${p.id}"><span class="pulse" aria-hidden="true"></span>${esc(p.name)}</a><span class="muted">${esc(p.stack.slice(0, 2).join(' · '))}</span></li>`).join('\n            ')}
          </ul>
          ${latest.length ? `<h2 class="panel-label">Latest from the log</h2>
          <ul class="now-log">
            ${latest.map((p) => `<li><time class="mono" datetime="${p.date}">${fmtDate(p.date)}</time><a href="blog/${p.slug}/">${esc(p.title)}</a></li>`).join('\n            ')}
          </ul>` : ''}
        </div>
      </aside>
    </section>

    <section id="projects" class="section container">
      <div class="section-head">
        <h2>Projects</h2>
        <p>Things I've built recently, mostly tools I use myself.</p>
      </div>
      <div class="project-grid">
          ${featured.map((p) => projectCard(p, root)).join('\n          ')}
      </div>
      ${earlier.length ? `<h3 class="subhead">Smaller projects &amp; coursework</h3>
      <ul class="earlier">
        ${earlier.map((p) => `<li id="project-${p.id}">
          <span class="mono muted">${esc(p.year)}</span>
          <div>
            <strong>${p.repo ? `<a href="${esc(p.repo)}" target="_blank" rel="noopener">${esc(p.name)}</a>` : esc(p.name)}</strong>
            <span class="muted">${esc(p.summary)}</span>
          </div>
          <span class="chip-row">${chips(p.stack)}</span>
        </li>`).join('\n        ')}
      </ul>` : ''}
    </section>

    ${certs.length ? `<section id="certifications" class="section container">
      <div class="section-head">
        <h2>Certifications</h2>
        <p>Credentials I've earned or am working toward.</p>
      </div>
      <div class="cert-grid">
          ${certs.map((c) => certCard(c, root)).join('\n          ')}
      </div>
    </section>` : ''}

    <section id="log" class="section container">
      <div class="section-head">
        <h2>From the log</h2>
        <p>Short daily notes on what I'm building, fixing and learning.</p>
      </div>
      ${latest.length
        ? `<ul class="log-list">
        ${latest.map((p) => postRow(p, root)).join('\n        ')}
      </ul>
      <a class="more-link" href="blog/">All log entries ${icon.arrow}</a>`
        : `<p class="muted">No entries yet.</p>`}
    </section>

    <section id="about" class="section container">
      <div class="section-head">
        <h2>About</h2>
      </div>
      <div class="about-grid">
        <div class="about-text">
          ${site.about.map((p) => `<p>${esc(p)}</p>`).join('\n          ')}
        </div>
        <div class="skills">
          ${site.skills.map((g) => `<div class="skill-group"><h3 class="mono">${esc(g.group)}</h3><div class="chip-row">${chips(g.items)}</div></div>`).join('\n          ')}
        </div>
      </div>
      <h3 class="subhead">Background</h3>
      <ol class="timeline">
        ${site.experience.map((e) => `<li>
          <span class="mono muted">${esc(e.when)}</span>
          <div><strong>${esc(e.title)}</strong> <span class="muted">· ${esc(e.org)}</span><p>${esc(e.detail)}</p></div>
        </li>`).join('\n        ')}
      </ol>
    </section>

    <section id="contact" class="section container">
      <div class="section-head">
        <h2>Contact</h2>
        <p>Have a role, a project or a question? Send me a note.</p>
      </div>
      <div class="contact-grid">
        <form class="panel contact-form" id="contact-form" data-endpoint="${esc(site.contactEndpoint)}" novalidate>
          <div class="panel-body">
            <label>Name<input type="text" name="name" autocomplete="name" required maxlength="200"></label>
            <label>Email<input type="email" name="email" autocomplete="email" required maxlength="320"></label>
            <label>Message<textarea name="message" rows="5" required maxlength="5000"></textarea></label>
            <label class="hp" aria-hidden="true">Company<input type="text" name="company" tabindex="-1" autocomplete="off"></label>
            <div class="form-foot">
              <button type="submit" class="btn btn-primary">Send message</button>
              <p class="form-status" role="status" aria-live="polite"></p>
            </div>
          </div>
        </form>
        <div class="contact-alt">
          <p>Or find me here:</p>
          <a href="${esc(site.links.github)}" target="_blank" rel="me noopener">${icon.github}<span>github.com/${esc(site.handle)}</span></a>
          <a href="${esc(site.links.linkedin)}" target="_blank" rel="me noopener">${icon.linkedin}<span>LinkedIn</span></a>
        </div>
      </div>
    </section>`;

  return layout({
    site,
    root,
    active: null,
    title: `${site.name} · ${site.role}`,
    description: site.tagline,
    canonical: site.url,
    body,
    hasCerts: certs.length > 0,
  });
}

// ---------------------------------------------------------------- blog index

function blogIndexPage({ site, posts, projects, certs, activity }) {
  const root = '../';
  const byMonth = new Map();
  for (const p of posts) {
    const key = p.date.slice(0, 7);
    if (!byMonth.has(key)) byMonth.set(key, []);
    byMonth.get(key).push(p);
  }
  const usedProjects = projects.filter((p) => p.postCount);
  const usedCerts = certs.filter((c) => c.postCount);
  const tags = [...new Set(posts.flatMap((p) => p.tags))].sort();

  const filterChip = (kind, value, label) =>
    `<button type="button" class="chip chip-${kind} filter" data-kind="${kind}" data-value="${esc(value)}" aria-pressed="false">${label}</button>`;

  const body = `
    <section class="section container page-head">
      <p class="eyebrow mono"><span class="prompt">$</span> tail -f log</p>
      <h1>Log</h1>
      <p class="lede">A running record of what I work on each day: projects, bugs, things I learned and certifications in progress.</p>
      ${posts.length ? activityGrid(activity, root) : ''}
    </section>

    <section class="section container log-section">
      ${posts.length ? `<div class="log-filters" id="log-filters">
        <input type="search" id="log-search" class="search" placeholder="Search entries…" aria-label="Search entries">
        <div class="chip-row">
          ${usedProjects.map((p) => filterChip('project', p.id, esc(p.name))).join('')}
          ${usedCerts.map((c) => filterChip('cert', c.id, esc(c.name))).join('')}
          ${tags.map((t) => filterChip('tag', t, `#${esc(t)}`)).join('')}
        </div>
      </div>
      <p class="log-empty muted" id="log-empty" hidden>No entries match that filter.</p>
      ${[...byMonth].map(([month, list]) => `<div class="log-month">
        <h2 class="month-label mono">${fmtMonth(month)}</h2>
        <ul class="log-list">
        ${list.map((p) => postRow(p, root)).join('\n        ')}
        </ul>
      </div>`).join('\n      ')}` : `<p class="muted">No entries yet. The first one is coming soon.</p>`}
    </section>`;

  return layout({
    site,
    root,
    active: 'log',
    title: `Log · ${site.name}`,
    description: `Daily notes from ${site.name} on projects, learning and certifications.`,
    canonical: site.url + 'blog/',
    body,
    hasCerts: certs.length > 0,
  });
}

// ---------------------------------------------------------------- post

function postPage({ site, post, prev, next, certs }) {
  const root = '../../';
  const body = `
    <article class="section container post">
      <a class="back-link mono" href="../">← Log</a>
      <header class="post-head">
        <h1>${esc(post.title)}</h1>
        <p class="post-meta mono"><time datetime="${post.date}">${fmtDate(post.date)}</time> <span class="dot-sep">·</span> ${post.readingTime} min read</p>
        ${postChips(post, root)}
      </header>
      <div class="prose">
${post.html}
      </div>
      ${post.projectRefs.length ? `<aside class="post-projects">
        ${post.projectRefs.map((p) => `<a class="panel mini-project" href="${root}#project-${p.id}">
          <span class="panel-label">Project</span>
          <strong>${esc(p.name)}</strong>
          <span class="muted">${esc(p.summary)}</span>
        </a>`).join('\n        ')}
      </aside>` : ''}
      <nav class="post-nav" aria-label="More entries">
        ${prev ? `<a href="../${prev.slug}/"><span class="mono muted">← Older</span>${esc(prev.title)}</a>` : '<span></span>'}
        ${next ? `<a class="next" href="../${next.slug}/"><span class="mono muted">Newer →</span>${esc(next.title)}</a>` : '<span></span>'}
      </nav>
    </article>`;

  return layout({
    site,
    root,
    active: 'log',
    title: `${post.title} · ${site.name}`,
    description: post.summary || `Log entry from ${fmtDate(post.date)}.`,
    canonical: `${site.url}blog/${post.slug}/`,
    body,
    hasCerts: certs.length > 0,
  });
}

// ---------------------------------------------------------------- rss

function feed({ site, posts }) {
  const x = esc;
  const items = posts
    .slice(0, 30)
    .map(
      (p) => `  <item>
    <title>${x(p.title)}</title>
    <link>${x(site.url)}blog/${p.slug}/</link>
    <guid>${x(site.url)}blog/${p.slug}/</guid>
    <pubDate>${new Date(p.date + 'T12:00:00Z').toUTCString()}</pubDate>
    <description>${x(p.html)}</description>
  </item>`
    )
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
  <title>${x(site.name)}: Log</title>
  <link>${x(site.url)}blog/</link>
  <description>Daily notes on projects, learning and certifications.</description>
${items}
</channel>
</rss>
`;
}

module.exports = { homePage, blogIndexPage, postPage, feed };
