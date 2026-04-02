import { test, expect } from '@playwright/test';

async function loginAs(
  page: import('@playwright/test').Page,
  username: string,
): Promise<void> {
  await page.goto('/login');
  await page.evaluate(() => localStorage.clear());
  await page.goto('/login');
  await page.getByTestId('username-input').fill(username);
  await page.getByTestId('password-input').fill('admin');
  await page.getByTestId('login-submit').click();
  await expect(page).toHaveURL('/');
}

test.describe('App Shell', () => {
  test('displays user context in header after login', async ({ page }) => {
    await loginAs(page, 'admin.supervisor');

    const userContext = page.getByTestId('user-context');
    await expect(userContext).toContainText('admin.supervisor');
    await expect(userContext).toContainText('Supervisor');
    await expect(userContext).toContainText('Weybridge');
  });

  test('displays user info in footer', async ({ page }) => {
    await loginAs(page, 'data.entry');

    const footer = page.getByTestId('app-footer');
    await expect(footer).toContainText('data.entry');
    await expect(footer).toContainText('DataEntry');
  });

  test('logout clears session and returns to login', async ({ page }) => {
    await loginAs(page, 'admin.supervisor');

    await page.getByTestId('logout-button').click();

    await expect(page).toHaveURL('/login');

    // Verify localStorage is cleared
    const token = await page.evaluate(() => localStorage.getItem('bst_token'));
    expect(token).toBeNull();

    // Verify navigating to / redirects back to login
    await page.goto('/');
    await expect(page).toHaveURL('/login');
  });

  test('header shows BST System title', async ({ page }) => {
    await loginAs(page, 'read.only');

    const header = page.getByTestId('app-header');
    await expect(header).toContainText('BST System');
  });

  test('access denied page shows reference ID and contact info', async ({ page }) => {
    await page.goto('/access-denied');

    await expect(page.getByTestId('access-denied-heading')).toContainText('Access Denied');
    await expect(page.getByTestId('reference-id')).toContainText(/Reference: UA-/);
    await expect(page.getByTestId('contact-info')).toContainText('bst-support@apha.gov.uk');
    await expect(page.getByTestId('contact-info')).toContainText('01234 567890');

    // Return to login button works
    await page.getByTestId('return-button').click();
    await expect(page).toHaveURL('/login');
  });
});
