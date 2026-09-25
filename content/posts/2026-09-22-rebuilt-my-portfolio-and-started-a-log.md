---
title: Rebuilt my portfolio and started this blog
date: 2026-09-22
summary: The old site still led with 2023 coursework, so I rebuilt it around what I'm building now and added a daily blog.
tags: [web, javascript, meta]
projects: [portfolio]
certs: []
---

My portfolio hadn't changed since last September. It still led with ClueGame and
TreeNodes, while most of my time this year has gone into
[Pilot](../../#project-pilot), [EventScout](../../#project-eventscout) and
[LeagueGraph](../../#project-leaguegraph). It also looked nothing like the tools I
actually build, so I redid it.

## What changed

- **One visual language.** The site now uses the same dark, panel-based look as
  LeagueGraph, AccountFinder and Cover Letter Tailor, with a light mode for
  anyone who wants it.
- **Projects reflect the present.** Current work is up front. Coursework moved to
  an "Earlier work" list instead of disappearing.
- **This blog.** Each post is a Markdown file in `content/posts/`. A roughly
  200-line Node script turns them into static pages, so it still deploys to
  GitHub Pages with no framework and no server.
- **Posts link to projects and certifications.** Tagging a post with a
  project adds it to that project's history, so every project card links to the
  days I spent on it.

## Writing a post

```bash
npm run post -- "Fixed the EventScout map filter"
# edit content/posts/<today>-fixed-the-eventscout-map-filter.md
npm run build
```

## Next up

- Write a post at the end of each working day, even a short one
- Add certifications as I start them
