// Smoke tests: every page loads cleanly and fits the screen.
import { test, expect } from '@playwright/test';
import { pages, watchForErrors } from './site';

for (const url of pages) {
  test.describe(`/${url}`, () => {
    test('loads with a title, one h1 and no errors', async ({ page }) => {
      const errors = watchForErrors(page);
      const res = await page.goto(url);
      expect(res?.status()).toBe(200);
      await expect(page).toHaveTitle(/Matthew Nielsen/);
      await expect(page.locator('h1')).toHaveCount(1);
      await page.waitForLoadState('networkidle');
      errors.check();
    });

    test('does not scroll sideways', async ({ page }) => {
      await page.goto(url);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow).toBeLessThanOrEqual(0);
    });
  });
}
