// Every internal link on every page goes somewhere real: the page exists and,
// for #anchors, the target element is on it.
import { test, expect } from '@playwright/test';
import { pages } from './site';

test('internal links and anchors resolve', async ({ page, request, baseURL }) => {
  const origin = new URL(baseURL!).origin;
  const targets = new Map<string, string>(); // absolute URL -> page it was found on

  for (const url of pages) {
    await page.goto(url);
    const hrefs = await page.locator('a[href]').evaluateAll((as) => as.map((a) => (a as HTMLAnchorElement).href));
    for (const href of hrefs) {
      if (new URL(href).origin === origin && !targets.has(href)) targets.set(href, url || '/');
    }
  }

  const broken: string[] = [];
  const htmlCache = new Map<string, string>();
  for (const [href, from] of targets) {
    const target = new URL(href);
    const hash = decodeURIComponent(target.hash.slice(1));
    target.hash = '';
    target.search = '';
    let html = htmlCache.get(target.href);
    if (html === undefined) {
      const res = await request.get(target.href);
      if (!res.ok()) {
        broken.push(`${res.status()} ${href} (linked from ${from})`);
        continue;
      }
      html = await res.text();
      htmlCache.set(target.href, html);
    }
    if (hash && !html.includes(`id="${hash}"`)) broken.push(`missing #${hash} on ${target.pathname} (linked from ${from})`);
  }

  expect(broken, broken.join('\n')).toEqual([]);
  expect(targets.size).toBeGreaterThan(5);
});
