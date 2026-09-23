# Portfolio & Log

**[Live site](https://jazzboy2567.github.io/portfolio-website/)** · [Vercel mirror](https://portfolio-website-zeta-ruddy.vercel.app)

My portfolio and a daily log of what I'm building. It's a static site generated
from Markdown and JSON by a small Node script, with no framework. GitHub Pages
and Vercel both build it from `main`, and the contact form runs as a Vercel
serverless function.

## Writing a log entry

```bash
npm run post -- "Fixed the EventScout map filter"   # creates content/posts/<today>-fixed-the-eventscout-map-filter.md
# write the entry, preview with npm run dev
git add content/posts && git commit -m "log: fixed the map filter" && git push
```

Each entry is Markdown with a small front matter block:

```markdown
---
title: Fixed the EventScout map filter
date: 2026-09-23
summary: One sentence shown in the log list and RSS feed.
tags: [javascript, bugfix]
projects: [eventscout]        # ids from content/projects.json
certs: []                     # ids from content/certifications.json
draft: false                  # true keeps it out of the build
---

What I did today…
```

Tagging a project or certification links them both ways. The entry shows the
project, and the project's card on the home page links to every entry about it.
A misspelled id fails the build and lists the valid ids.

## Editing the rest of the site

| What | Where |
| --- | --- |
| Name, tagline, about, skills, background | `content/site.json` |
| Projects (`featured: false` puts it in the smaller-projects list) | `content/projects.json` |
| Certifications (section appears once the list isn't empty) | `content/certifications.json` |
| Page markup | `src/templates.js` |
| Styles / client JS | `public/` |

A certification looks like this:

```json
{
  "id": "aws-ccp",
  "name": "AWS Certified Cloud Practitioner",
  "issuer": "Amazon Web Services",
  "date": "2026-10",
  "status": "earned",
  "url": "https://www.credly.com/badges/…",
  "skills": ["AWS", "Cloud"]
}
```

Use `"status": "in-progress"` and leave `date`/`url` empty while you're working
toward one. Log entries tagged with it will show your progress.

## Deployment

- **GitHub Pages:** `.github/workflows/pages.yml` builds and deploys `dist/` on
  every push to `main`. Requires Settings → Pages → Source: **GitHub Actions**.
- **Vercel:** builds with `npm run build` and serves `dist/` plus `api/`
  (`vercel.json`). Set `EMAIL_USER`/`EMAIL_PASS` for the contact form. Optional:
  `EMAIL_TO`, `EMAIL_FROM`, `CORS_ORIGIN`, or `SMTP_HOST`/`SMTP_PORT`/`SMTP_USER`/`SMTP_PASS`.

## Local development

```bash
npm install
npm run dev      # builds to dist/, rebuilds on changes, serves http://localhost:3000
```

The contact form sends real email if `EMAIL_USER`/`EMAIL_PASS` are in `.env`.

## Layout

```
content/            site data + posts
public/             static assets (styles, scripts), copied into dist/
src/templates.js    HTML for every page
src/frontmatter.js  post front matter parser
scripts/build.js    content/ + public/ → dist/
api/contact.js      contact form (Vercel function; also mounted by server.js)
dist/               build output (not committed)
```
