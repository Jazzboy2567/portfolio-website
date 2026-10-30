// The built pages show everything in content/.
import { test, expect } from '@playwright/test';
import { projects, certs, posts } from './site';

test.describe('home page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
  });

  test('shows every featured project as a card', async ({ page }) => {
    for (const p of projects.filter((p) => p.featured)) {
      const card = page.locator(`#project-${p.id}`);
      await expect(card.getByRole('heading', { name: p.name })).toBeVisible();
      if (p.repo) await expect(card.getByRole('link', { name: 'Source' })).toHaveAttribute('href', p.repo);
    }
  });

  test('lists every smaller project', async ({ page }) => {
    for (const p of projects.filter((p) => !p.featured)) {
      await expect(page.locator(`#project-${p.id}`)).toContainText(p.name);
    }
  });

  test('shows every certification with its status', async ({ page }) => {
    for (const c of certs) {
      const card = page.locator(`#cert-${c.id}`);
      await expect(card.getByRole('heading', { name: c.name })).toBeVisible();
      await expect(card).toContainText(c.status === 'in-progress' ? 'In progress' : 'Earned');
    }
  });

  test('links to the newest blog posts', async ({ page }) => {
    const newest = [...posts].sort((a, b) => b.slug.localeCompare(a.slug))[0];
    test.skip(!newest, 'no posts yet');
    await expect(page.locator('#log').getByRole('link', { name: newest.title })).toBeVisible();
  });
});

test.describe('blog', () => {
  test('lists every published post', async ({ page }) => {
    await page.goto('blog/');
    await expect(page.locator('.log-row')).toHaveCount(posts.length);
    for (const p of posts) {
      await expect(page.getByRole('link', { name: p.title, exact: true })).toHaveAttribute('href', `../blog/${p.slug}/`);
    }
  });

  test('search filters the list and shows a message when nothing matches', async ({ page }) => {
    test.skip(posts.length === 0, 'no posts yet');
    await page.goto('blog/');
    const search = page.getByRole('searchbox', { name: 'Search posts' });
    await search.fill(posts[0].title.toLowerCase());
    await expect(page.locator('.log-row:visible')).not.toHaveCount(0);
    await search.fill('zzz-no-post-has-this');
    await expect(page.locator('.log-row:visible')).toHaveCount(0);
    await expect(page.getByText('No posts match that filter.')).toBeVisible();
  });

  test('filter chips toggle and update the URL', async ({ page }) => {
    await page.goto('blog/');
    const chip = page.locator('button.filter').first();
    test.skip((await chip.count()) === 0, 'no tags, projects or certs on posts yet');
    const kind = await chip.getAttribute('data-kind');
    const value = await chip.getAttribute('data-value');

    await chip.click();
    await expect(chip).toHaveAttribute('aria-pressed', 'true');
    await expect(page).toHaveURL(new RegExp(`\\?${kind}=${encodeURIComponent(value!)}$`));

    await chip.click();
    await expect(chip).toHaveAttribute('aria-pressed', 'false');
    await expect(page.locator('.log-row:visible')).toHaveCount(posts.length);
  });

  test('each post page shows its title and links back to the blog', async ({ page }) => {
    for (const p of posts) {
      await page.goto(`blog/${p.slug}/`);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(p.title);
      await page.getByRole('link', { name: '← Blog' }).click();
      await expect(page).toHaveURL(/\/blog\/$/);
    }
  });
});
