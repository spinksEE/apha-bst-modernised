import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage to ensure clean state
    await page.goto('/login');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/login');
  });

  test('valid login as Supervisor navigates to home page', async ({ page }) => {
    await page.getByTestId('username-input').fill('admin.supervisor');
    await page.getByTestId('password-input').fill('admin');
    await page.getByTestId('login-submit').click();

    await expect(page).toHaveURL('/');
    await expect(page.getByTestId('welcome-banner')).toContainText('admin.supervisor');
    await expect(page.getByTestId('user-context')).toContainText('Supervisor');
    await expect(page.getByTestId('user-context')).toContainText('Weybridge');
  });

  test('valid login as DataEntry navigates to home page', async ({ page }) => {
    await page.getByTestId('username-input').fill('data.entry');
    await page.getByTestId('password-input').fill('admin');
    await page.getByTestId('login-submit').click();

    await expect(page).toHaveURL('/');
    await expect(page.getByTestId('welcome-banner')).toContainText('data.entry');
    await expect(page.getByTestId('user-context')).toContainText('DataEntry');
  });

  test('valid login as ReadOnly navigates to home page', async ({ page }) => {
    await page.getByTestId('username-input').fill('read.only');
    await page.getByTestId('password-input').fill('admin');
    await page.getByTestId('login-submit').click();

    await expect(page).toHaveURL('/');
    await expect(page.getByTestId('welcome-banner')).toContainText('read.only');
    await expect(page.getByTestId('user-context')).toContainText('ReadOnly');
  });

  test('non-existent user redirects to access denied', async ({ page }) => {
    await page.getByTestId('username-input').fill('unknown.user');
    await page.getByTestId('password-input').fill('admin');
    await page.getByTestId('login-submit').click();

    await expect(page).toHaveURL('/access-denied');
    await expect(page.getByTestId('access-denied-heading')).toBeVisible();
    await expect(page.getByTestId('reference-id')).toContainText(/UA-\d{8}-\d{4}-[A-Z0-9]{3}/);
  });

  test('wrong password shows inline error', async ({ page }) => {
    await page.getByTestId('username-input').fill('admin.supervisor');
    await page.getByTestId('password-input').fill('wrong-password');
    await page.getByTestId('login-submit').click();

    await expect(page.getByTestId('login-error')).toContainText('Invalid username or password');
    await expect(page).toHaveURL('/login');
  });

  test('Supervisor sees User Management card on home page', async ({ page }) => {
    await page.getByTestId('username-input').fill('admin.supervisor');
    await page.getByTestId('password-input').fill('admin');
    await page.getByTestId('login-submit').click();

    await expect(page).toHaveURL('/');
    await expect(page.getByTestId('nav-user-management')).toBeVisible();
  });

  test('DataEntry user does not see User Management card', async ({ page }) => {
    await page.getByTestId('username-input').fill('data.entry');
    await page.getByTestId('password-input').fill('admin');
    await page.getByTestId('login-submit').click();

    await expect(page).toHaveURL('/');
    await expect(page.getByTestId('nav-user-management')).not.toBeVisible();
  });
});
