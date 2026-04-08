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

  test('API returns seeded person records', async ({ request }) => {
    const response = await request.get(`${API}/persons`);

    expect(response.ok()).toBe(true);

    const persons = await response.json();
    expect(Array.isArray(persons)).toBe(true);
    expect(persons.length).toBeGreaterThanOrEqual(7);

    // Verify known seed person: James Wilson at Greenfield Farm
    const wilson = persons.find(
      (p: { first_name: string; last_name: string }) =>
        p.first_name === 'James' && p.last_name === 'Wilson',
    );
    expect(wilson).toBeDefined();
    expect(wilson.display_name).toBe('Wilson, James');
    expect(wilson.site_id).toBe('AB12345678');
    expect(wilson.has_training).toBe(true);
  });

  test('API returns seeded trainer records', async ({ request }) => {
    const response = await request.get(`${API}/trainers`);

    expect(response.ok()).toBe(true);

    const trainers = await response.json();
    expect(Array.isArray(trainers)).toBe(true);
    expect(trainers.length).toBeGreaterThanOrEqual(2);

    // Verify APHA staff trainer: Catherine Reed at Weybridge
    const reed = trainers.find(
      (t: { first_name: string; last_name: string }) =>
        t.first_name === 'Catherine' && t.last_name === 'Reed',
    );
    expect(reed).toBeDefined();
    expect(reed.display_name).toBe('Reed, Catherine');
    expect(reed.location_id).toBe('EF34567890');
    expect(reed.person_id).toBeNull();
  });

  test('Greenfield Farm shows seeded personnel in site view', async ({ page }) => {
    await page.goto('/sites');

    const searchInput = page.getByTestId('site-search-input');
    await searchInput.fill('Greenfield');
    await page.getByRole('option', { name: /Greenfield Farm/ }).click();

    // Should show personnel count > 0
    await expect(page.getByTestId('personnel-count')).toContainText('Total Personnel: 4');

    // Should show seeded person names
    await expect(page.getByText('Wilson, James')).toBeVisible();
    await expect(page.getByText('Thompson, Sarah')).toBeVisible();
  });

  test('API returns seeded training records', async ({ request }) => {
    // Find James Wilson's person_id
    const personsRes = await request.get(`${API}/persons`);
    const persons = await personsRes.json();
    const wilson = persons.find(
      (p: { first_name: string; last_name: string }) =>
        p.first_name === 'James' && p.last_name === 'Wilson',
    );
    expect(wilson).toBeDefined();

    // Fetch training records for James Wilson
    const trainingsRes = await request.get(
      `${API}/trainings/by-trainee?trainee_id=${wilson.person_id}`,
    );
    expect(trainingsRes.ok()).toBe(true);

    const trainings = await trainingsRes.json();
    expect(Array.isArray(trainings)).toBe(true);
    expect(trainings.length).toBeGreaterThanOrEqual(2);

    // Verify known seed training: Trained in Cattle on 2025-06-15
    const cattleTraining = trainings.find(
      (t: { training_type: string; date_trained: string }) =>
        t.training_type === 'Trained' && t.date_trained === '2025-06-15',
    );
    expect(cattleTraining).toBeDefined();
    expect(cattleTraining.species_trained).toContain('Cattle');

    // Verify CascadeTrained in Goat, Sheep on 2025-09-20
    const cascadeTraining = trainings.find(
      (t: { training_type: string; date_trained: string }) =>
        t.training_type === 'CascadeTrained' && t.date_trained === '2025-09-20',
    );
    expect(cascadeTraining).toBeDefined();
    expect(cascadeTraining.species_trained).toContain('Goat');
    expect(cascadeTraining.species_trained).toContain('Sheep');
  });

  test('training history page shows seeded data for James Wilson', async ({ page, request }) => {
    // Find James Wilson's person_id
    const personsRes = await request.get(`${API}/persons`);
    const persons = await personsRes.json();
    const wilson = persons.find(
      (p: { first_name: string; last_name: string }) =>
        p.first_name === 'James' && p.last_name === 'Wilson',
    );
    expect(wilson).toBeDefined();

    await page.goto(`/persons/${wilson.person_id}/training`);

    // Person details should be visible
    await expect(page.getByTestId('person-name')).toContainText('Wilson, James');

    // Training table should have at least 2 rows (2 seed records for Wilson)
    const table = page.getByTestId('training-table');
    await expect(table).toBeVisible();
    const rows = table.locator('tbody tr');
    expect(await rows.count()).toBeGreaterThanOrEqual(2);

    // Should show seeded training types
    await expect(table).toContainText('Trained');
    await expect(table).toContainText('Cascade Trained');
  });
});
