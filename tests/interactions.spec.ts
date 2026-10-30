// Theme toggle, mobile menu and contact form. The contact API is faked with
// page.route, so these tests never send real email.
import { test, expect } from '@playwright/test';

test('theme toggle switches and survives a reload', async ({ page }) => {
  await page.goto('');
  const html = page.locator('html');
  const before = await html.getAttribute('data-theme');
  const after = before === 'light' ? 'dark' : 'light';

  await page.getByRole('button', { name: 'Toggle color theme' }).click();
  await expect(html).toHaveAttribute('data-theme', after);
  await page.reload();
  await expect(html).toHaveAttribute('data-theme', after);
});

test('mobile menu opens and closes after picking a link', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'menu button only shows on small screens');
  await page.goto('');
  const toggle = page.getByRole('button', { name: 'Menu' });
  const links = page.locator('#nav-links');

  await expect(links.getByRole('link', { name: 'Projects' })).toBeHidden();
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await links.getByRole('link', { name: 'Projects' }).click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(page).toHaveURL(/#projects$/);
});

test.describe('contact form', () => {
  const fill = async (page: import('@playwright/test').Page) => {
    const form = page.locator('#contact-form');
    await form.getByLabel('Name').fill('Test Recruiter');
    await form.getByLabel('Email').fill('recruiter@example.com');
    await form.getByLabel('Message').fill('Hello from Playwright.');
    return form;
  };

  test.beforeEach(async ({ page }) => {
    await page.goto('#contact');
  });

  test('does not send when fields are empty', async ({ page }) => {
    let sent = false;
    await page.route('**/api/contact', (route) => {
      sent = true;
      return route.abort();
    });
    await page.getByRole('button', { name: 'Send message' }).click();
    await expect(page.locator('#contact-form input[name="name"]:invalid')).toHaveCount(1);
    expect(sent).toBe(false);
  });

  test('shows a thank-you and clears the form on success', async ({ page }) => {
    let body: Record<string, string> = {};
    await page.route('**/api/contact', async (route) => {
      body = route.request().postDataJSON();
      await route.fulfill({ json: { success: true } });
    });
    const form = await fill(page);
    await form.getByRole('button', { name: 'Send message' }).click();

    await expect(form.getByRole('status')).toContainText('Thanks!');
    await expect(form.getByLabel('Name')).toHaveValue('');
    expect(body).toMatchObject({ name: 'Test Recruiter', email: 'recruiter@example.com', message: 'Hello from Playwright.' });
  });

  test('points to LinkedIn when sending fails', async ({ page }) => {
    await page.route('**/api/contact', (route) => route.fulfill({ status: 500, json: { success: false } }));
    const form = await fill(page);
    await form.getByRole('button', { name: 'Send message' }).click();

    await expect(form.getByRole('status')).toContainText('LinkedIn');
    await expect(form.getByLabel('Name')).toHaveValue('Test Recruiter');
  });
});

test.describe('admin login', () => {
  test('shows the login form and rejects a wrong password', async ({ page }) => {
    await page.route('**/api/login', (route) =>
      route.request().method() === 'GET'
        ? route.fulfill({ json: { authenticated: false } })
        : route.fulfill({ status: 401, json: { error: 'Wrong password.' } })
    );
    await page.goto('admin/');
    await page.getByLabel('Password').fill('not-the-password');
    await page.getByRole('button', { name: 'Log in' }).click();
    await expect(page.locator('#login-status')).toHaveText('Wrong password.');
  });
});
