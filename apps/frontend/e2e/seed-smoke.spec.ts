import { test, expect } from '@playwright/test';

/**
 * Seed Smoke Tests — FT-001-FIX Definition of Done, Section 9
 *
 * Verifies that dev seed data (from prisma/seed.ts) is visible through
 * both the UI and the API. No database stubs, no API mocks — runs
 * against the live Docker stack after migration + seed.
 */

const API = 'http://localhost:3001/api';

test.describe('Seed smoke tests', () => {
  test('sites table shows all seeded sites on page load', async ({ page }) => {
    await page.goto('/sites');

    const table = page.getByTestId('sites-table');
    await expect(table).toBeVisible();

    const rows = table.locator('tbody tr');
    await expect(rows.first()).toBeVisible();
    expect(await rows.count()).toBeGreaterThanOrEqual(10);
  });

  test('known seed site is searchable and displays correct details', async ({ page }) => {
    await page.goto('/sites');

    const searchInput = page.getByTestId('site-search-input');
    await searchInput.fill('Greenfield');

    // The seed site "Greenfield Farm" (plant_no AB12345678) should appear
    await expect(page.getByRole('option', { name: /Greenfield Farm/ })).toBeVisible();
    await page.getByRole('option', { name: /Greenfield Farm/ }).click();

    // Verify the site details card renders with seed data
    const card = page.getByTestId('site-details-card');
    await expect(card).toBeVisible();
    await expect(card).toContainText('Greenfield Farm');
    await expect(card).toContainText('AB12345678');
    await expect(card).toContainText('Hereford');
    await expect(card).toContainText('HR1 2AB');
  });

  test('API returns at least 10 seeded sites', async ({ request }) => {
    const response = await request.get(`${API}/sites`);

    expect(response.ok()).toBe(true);

    const sites = await response.json();
    expect(Array.isArray(sites)).toBe(true);
    expect(sites.length).toBeGreaterThanOrEqual(10);
  });
});
