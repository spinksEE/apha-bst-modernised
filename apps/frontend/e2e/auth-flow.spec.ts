import { test, expect } from '@playwright/test';

type UserContextFixture = {
  name: string;
  role: string;
  location: string;
};

const expectUserContext = async (
  page: import('@playwright/test').Page,
  { name, role, location }: UserContextFixture,
): Promise<void> => {
  const userContextRegion = page.getByRole('region', { name: 'User context' });
  await expect(userContextRegion.getByText(`Welcome: ${name} (${role})`)).toBeVisible();
  await expect(userContextRegion.getByText(location)).toBeVisible();
};

test.describe('Authentication flow', () => {
  test('logs in and shows supervisor navigation options', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Log In' })).toBeVisible();

    await page.getByLabel('Username').fill('supervisor');
    await page.getByLabel('Password').fill('Password123');
    await page.getByRole('button', { name: 'Log In' }).click();

    await expect(page.getByRole('heading', { name: 'BST System - Home' })).toBeVisible();
    await expectUserContext(page, {
      name: 'Supervisor User',
      role: 'Supervisor',
      location: 'APHA Headquarters',
    });
    await expect(page.getByText('User Management')).toBeVisible();
  });

  test('shows access denied page for inactive user', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Username').fill('inactive');
    await page.getByLabel('Password').fill('Password123');
    await page.getByRole('button', { name: 'Log In' }).click();

    await expect(page.getByRole('heading', { name: 'Access Denied' })).toBeVisible();
    await expect(page.getByText('Reference ID:')).toBeVisible();
    await page.getByRole('button', { name: 'Return' }).click();
    await expect(page.getByRole('heading', { name: 'Log In' })).toBeVisible();
  });

  test('hides supervisor-only navigation for data entry role', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Username').fill('dataentry');
    await page.getByLabel('Password').fill('Password123');
    await page.getByRole('button', { name: 'Log In' }).click();

    await expect(page.getByRole('heading', { name: 'BST System - Home' })).toBeVisible();
    await expectUserContext(page, {
      name: 'Data Entry User',
      role: 'Data Entry',
      location: 'APHA North East',
    });
    await expect(page.getByText('User Management')).toHaveCount(0);
  });
});
