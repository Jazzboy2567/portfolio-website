// Automated accessibility scan (axe-core, WCAG 2.1 A/AA) of every page in
// both color themes. Catches things like missing labels, alt text and low
// contrast; it doesn't replace trying the site with a keyboard or screen reader.
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { pages } from './site';

for (const theme of ['dark', 'light'] as const) {
  for (const url of pages) {
    test(`/${url} has no accessibility violations (${theme})`, async ({ page }) => {
      await page.addInitScript((t) => localStorage.setItem('theme', t), theme);
      await page.goto(url);
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
      const summary = results.violations.map(
        (v) => `${v.id} (${v.impact}): ${v.help}\n  ${v.nodes.map((n) => n.target.join(' ')).join('\n  ')}`
      );
      expect(summary, summary.join('\n')).toEqual([]);
    });
  }
}
