# Portfolio & Blog

**[Live site](https://jazzboy2567.github.io/portfolio-website/)** · [Vercel](https://matthew-nielsen.vercel.app) (also hosts the blog editor)

My portfolio and a daily blog about what I'm building. It's a static site generated
from Markdown and JSON by a small Node script, with no framework. There's a
password-protected editor at `/admin/` for writing and editing posts in the
browser.

## Writing a blog post

1. Go to **https://matthew-nielsen.vercel.app/admin/** and log in.
   The GitHub Pages copy redirects there, because the editor needs Vercel's API.
2. **Today's post** opens today's post, or starts one if there isn't one yet.
   Any past post can be opened from the list and edited.
3. **Publish** or **Save as draft** (drafts stay off the site). Ctrl/Cmd+S saves.

Saving commits `content/posts/<date>-<title>.md` to this repo. Vercel and the
GitHub Pages workflow rebuild automatically, so it's live in about a minute.
Once saved, a post keeps its URL even if you change its title.

> Drafts are hidden from the site but, since this repo is public, their
> Markdown is visible on GitHub.

You can still write posts by hand: `npm run post -- "Title"` creates the file,
then commit and push.

## One-time setup

**1. GitHub token.** The editor commits posts using a fine-grained personal
access token: GitHub → Settings → Developer settings → Fine-grained tokens →
*Generate new token*.
- Repository access: **Only select repositories → portfolio-website**
- Permissions: **Contents → Read and write** (nothing else)

**2. Vercel environment variables** (Project → Settings → Environment Variables,
then redeploy):

| Variable | Value |
| --- | --- |
| `ADMIN_PASSWORD` | A long password; this is your login |
| `SESSION_SECRET` | 32+ random characters, e.g. from `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `GITHUB_TOKEN` | The token from step 1 |
| `EMAIL_USER`, `EMAIL_PASS` | Gmail address + app password for the contact form |

Optional: `GITHUB_REPO` (default `Jazzboy2567/portfolio-website`),
`GITHUB_BRANCH` (default `main`), `EMAIL_TO`, `EMAIL_FROM`, `CORS_ORIGIN`, or
`SMTP_HOST`/`SMTP_PORT`/`SMTP_USER`/`SMTP_PASS` for non-Gmail SMTP.

**3. GitHub Pages source.** Settings → Pages → Source: **GitHub Actions**.
`.github/workflows/pages.yml` builds and deploys on every push to `main`.

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
toward one. Once it's in the file, it shows up as a checkbox in the editor so
you can tag blog posts with your progress.

## Local development

```bash
npm install
npm run dev      # builds to dist/, rebuilds on changes, serves http://localhost:3000
```

With no `GITHUB_TOKEN` in `.env`, the editor at `http://localhost:3000/admin/`
reads and writes `content/posts/` on disk instead of committing to GitHub,
which is handy for trying things out. It still needs `ADMIN_PASSWORD` and
`SESSION_SECRET` in `.env`. The contact form sends real email if
`EMAIL_USER`/`EMAIL_PASS` are set.

## Layout

```
content/            site data + posts
public/             static assets (styles, scripts, admin.js), copied into dist/
src/templates.js    HTML for every page
src/frontmatter.js  post front matter parse/serialize (build + API)
scripts/build.js    content/ + public/ → dist/
api/                Vercel functions: contact, login, posts (also mounted by server.js)
api/_lib/           auth (session cookie) and post storage (GitHub or local disk)
dist/               build output (not committed)
```
