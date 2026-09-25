#!/usr/bin/env node
// Creates today's blog post: npm run post -- "What I worked on"

const fs = require('fs');
const path = require('path');

const CONTENT = path.join(__dirname, '..', 'content');
const title = process.argv.slice(2).join(' ').trim() || 'Daily update';

const now = new Date();
const pad = (n) => String(n).padStart(2, '0');
const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
const slug = title
  .toLowerCase()
  .replace(/['’]/g, '')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .slice(0, 60);

const base = path.join(CONTENT, 'posts', `${date}-${slug || 'post'}`);
let file = `${base}.md`;
for (let n = 2; fs.existsSync(file); n++) file = `${base}-${n}.md`;

const ids = (name) => JSON.parse(fs.readFileSync(path.join(CONTENT, name), 'utf8')).map((x) => x.id).join(', ') || '(none yet)';

fs.mkdirSync(path.dirname(file), { recursive: true });
fs.writeFileSync(
  file,
  `---
title: ${title}
date: ${date}
summary: One sentence shown in the blog list.
tags: []
# project ids: ${ids('projects.json')}
projects: []
# cert ids: ${ids('certifications.json')}
certs: []
# draft: true keeps this post out of the build
draft: false
---

## What I worked on

-

## What I learned

-

## Next up

-
`
);

console.log(`Created ${path.relative(process.cwd(), file)}`);
console.log('Write it, then run: npm run build');
