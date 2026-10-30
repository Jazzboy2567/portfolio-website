// Reads content/ the same way scripts/build.js does, so tests check the built
// pages against the source data instead of hard-coding project or post names.
import fs from 'fs';
import path from 'path';
import { expect, type Page } from '@playwright/test';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const frontmatter = require('../src/frontmatter');

const CONTENT = path.join(__dirname, '..', 'content');
const readJSON = (file: string) => JSON.parse(fs.readFileSync(path.join(CONTENT, file), 'utf8'));

export interface Project {
  id: string;
  name: string;
  featured?: boolean;
  repo?: string;
}

export interface Cert {
  id: string;
  name: string;
  status?: string;
}

export interface Post {
  slug: string;
  title: string;
}

export const projects: Project[] = readJSON('projects.json');
export const certs: Cert[] = readJSON('certifications.json');

export const posts: Post[] = fs
  .readdirSync(path.join(CONTENT, 'posts'))
  .filter((f) => f.endsWith('.md'))
  .map((file) => {
    const { data } = frontmatter.parse(fs.readFileSync(path.join(CONTENT, 'posts', file), 'utf8'), file);
    return { slug: file.replace(/\.md$/, ''), title: data.title, draft: data.draft === true };
  })
  .filter((p) => !p.draft)
  .map(({ slug, title }) => ({ slug, title }));

// Every public page the build generates (admin is tested on its own).
export const pages: string[] = ['', 'blog/', ...posts.map((p) => `blog/${p.slug}/`)];

// Collects console errors and failed requests so a test can assert none happened.
export function watchForErrors(page: Page) {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`console: ${msg.text()}`);
  });
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  page.on('response', (res) => {
    if (res.status() >= 400) errors.push(`${res.status()} ${res.url()}`);
  });
  return {
    check: () => expect(errors, errors.join('\n')).toEqual([]),
  };
}
