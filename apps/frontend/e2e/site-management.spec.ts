import { test, expect, type APIRequestContext } from '@playwright/test';

/**
 * FT-001: Site Management — Playwright Acceptance Tests
 *
 * Covers all four user stories:
 *   US-001: Register a new sampling site
 *   US-002: View site details and related trainees
 *   US-003: Evolve site names through mergers
 *   US-004: Prevent deletion of sites with personnel / delete empty sites
 *
 * Tests run against the live dev stack (frontend :3000, backend :3001, postgres).
 * Each test uses unique plant numbers and cleans up its own data.
 */

const API = 'http://localhost:3001/api';

async function seedSite(
  request: APIRequestContext,
  data: {
    plant_no: string;
    name: string;
    address_line_1?: string;
    address_line_2?: string;
    address_town?: string;
    address_county?: string;
    address_post_code?: string;
    telephone?: string;
    fax?: string;
    is_apha_site?: boolean;
  },
) {
  const res = await request.post(`${API}/sites`, { data });
  expect(res.ok(), `Seed failed for ${data.plant_no}: ${res.status()}`).toBe(true);
}

async function removeSite(request: APIRequestContext, plantNo: string) {
  await request.delete(`${API}/sites/${plantNo}`);
}

// ============================================================================
// US-001: Register a new sampling site
// ============================================================================
test.describe('US-001: Register a new site', () => {
  test('registers a new site with all fields populated', async ({ page, request }) => {
    const pn = 'E2E001A';
    // Ensure clean state
    await removeSite(request, pn);

    await page.goto('/sites/register');

    await page.getByTestId('plant-no-input').fill(pn);
    await page.getByTestId('site-name-input').fill('E2E Full Site');
    await page.getByLabel('Address line 1').fill('123 Test Lane');
    await page.getByLabel('Address line 2').fill('Suite 4');
    await page.getByLabel('Town').fill('Testville');
    await page.getByLabel('County').fill('Testshire');
    await page.getByLabel('Post code').fill('TS1 2AB');
    await page.getByLabel('Telephone').fill('01234567');
    await page.getByLabel('Fax').fill('01fax567');
    await page.getByLabel('This is an APHA site').check();

    await page.getByTestId('save-button').click();

    // Should redirect to /sites with the new site pre-selected
    await expect(page).toHaveURL(/\/sites\?selected=E2E001A/);

    // The site details card should show the site data
    const card = page.getByTestId('site-details-card');
    await expect(card).toContainText('E2E Full Site');
    await expect(card).toContainText(pn);
    await expect(card).toContainText('123 Test Lane');
    await expect(card).toContainText('Testville');

    // Cleanup
    await removeSite(request, pn);
  });

  test('shows error for duplicate plant number (BR-006)', async ({ page, request }) => {
    const pn = 'E2E001B';
    await removeSite(request, pn);
    await seedSite(request, { plant_no: pn, name: 'Existing BR006' });

    await page.goto('/sites/register');
    await page.getByTestId('plant-no-input').fill(pn);
    await page.getByTestId('site-name-input').fill('New Name BR006');
    await page.getByTestId('save-button').click();

    await expect(page.getByText('A site with this Plant Number already exists').first()).toBeVisible();

    await removeSite(request, pn);
  });

  test('shows error for duplicate site name (BR-015)', async ({ page, request }) => {
    const pn = 'E2E001C';
    const pn2 = 'E2E001C2';
    await removeSite(request, pn);
    await removeSite(request, pn2);
    await seedSite(request, { plant_no: pn, name: 'DupNameE2E' });

    await page.goto('/sites/register');
    await page.getByTestId('plant-no-input').fill(pn2);
    await page.getByTestId('site-name-input').fill('DupNameE2E');
    await page.getByTestId('save-button').click();

    await expect(page.getByText('A site with this Name already exists').first()).toBeVisible();

    await removeSite(request, pn);
    await removeSite(request, pn2);
  });

  test('required field validation prevents empty submission', async ({ page }) => {
    await page.goto('/sites/register');
    await page.getByTestId('save-button').click();

    await expect(page.getByText('Enter a plant number')).toBeVisible();
    await expect(page.getByText('Enter a site name')).toBeVisible();
  });
});

// ============================================================================
// US-002: View site details and related trainees
// ============================================================================
test.describe('US-002: View site details and trainees', () => {
  test('searches by site name in typeahead and selects a site', async ({ page, request }) => {
    const pn = 'E2E002A';
    await removeSite(request, pn);
    await seedSite(request, {
      plant_no: pn,
      name: 'AlphaSearchE2E',
      address_town: 'Farmington',
      address_post_code: 'FA1 1AA',
      telephone: '01234567',
    });

    await page.goto('/sites');
    const searchInput = page.getByTestId('site-search-input');
    await searchInput.fill('AlphaSearch');

    // Wait for dropdown option
    await expect(page.getByRole('option', { name: /AlphaSearchE2E/ })).toBeVisible();

    // Select
    await page.getByRole('option', { name: /AlphaSearchE2E/ }).click();

    // Verify details card
    const card = page.getByTestId('site-details-card');
    await expect(card).toBeVisible();
    await expect(card).toContainText('AlphaSearchE2E');
    await expect(card).toContainText(pn);
    await expect(card).toContainText('Farmington');
    await expect(card).toContainText('FA1 1AA');
    await expect(card).toContainText('01234567');
    await expect(card).toContainText('Total Personnel: 0');

    await removeSite(request, pn);
  });

  test('shows empty personnel message for selected site', async ({ page, request }) => {
    const pn = 'E2E002B';
    await removeSite(request, pn);
    await seedSite(request, { plant_no: pn, name: 'BetaEmptyE2E' });

    await page.goto('/sites');
    const searchInput = page.getByTestId('site-search-input');
    await searchInput.fill('BetaEmpty');
    await page.getByRole('option', { name: /BetaEmptyE2E/ }).click();

    await expect(page.getByTestId('no-trainees-message')).toContainText(
      'No trainees associated with this site',
    );

    await removeSite(request, pn);
  });
});

// ============================================================================
// US-003: Evolve site names through mergers
// ============================================================================
test.describe('US-003: Edit site name (name evolution)', () => {
  test('evolves a simple site name to "New [Old]" format', async ({ page, request }) => {
    const pn = 'E2E003A';
    await removeSite(request, pn);
    await seedSite(request, { plant_no: pn, name: 'Old Abattoir Co' });

    await page.goto(`/sites/${pn}/edit`);

    // Verify read-only fields
    await expect(page.getByTestId('plant-no-readonly')).toHaveValue(pn);
    await expect(page.getByTestId('current-name-readonly')).toHaveValue('Old Abattoir Co');

    // Enter new name and save
    await page.getByTestId('new-name-input').fill('New Meadow Farms');
    await page.getByTestId('save-button').click();

    // Should redirect and show the evolved name
    await expect(page).toHaveURL(/\/sites\?selected=E2E003A/);
    await expect(page.getByTestId('site-details-card')).toContainText(
      'New Meadow Farms [Old Abattoir Co]',
    );

    await removeSite(request, pn);
  });

  test('evolves an already-evolved name without nesting brackets', async ({ page, request }) => {
    const pn = 'E2E003B';
    await removeSite(request, pn);
    await seedSite(request, { plant_no: pn, name: 'Current Name [Old Name]' });

    await page.goto(`/sites/${pn}/edit`);

    await expect(page.getByTestId('current-name-readonly')).toHaveValue(
      'Current Name [Old Name]',
    );

    await page.getByTestId('new-name-input').fill('Future Name');
    await page.getByTestId('save-button').click();

    await expect(page).toHaveURL(/\/sites\?selected=E2E003B/);
    // Should strip old bracket and use base name only: "Future Name [Current Name]"
    await expect(page.getByTestId('site-details-card')).toContainText(
      'Future Name [Current Name]',
    );

    await removeSite(request, pn);
  });

  test('plant number field is read-only on edit page', async ({ page, request }) => {
    const pn = 'E2E003C';
    await removeSite(request, pn);
    await seedSite(request, { plant_no: pn, name: 'ReadonlyTestE2E' });

    await page.goto(`/sites/${pn}/edit`);

    await expect(page.getByTestId('plant-no-readonly')).toBeDisabled();

    await removeSite(request, pn);
  });
});

// ============================================================================
// US-004: Delete site
// ============================================================================
test.describe('US-004: Delete site', () => {
  test('deletes a site after confirmation', async ({ page, request }) => {
    const pn = 'E2E004A';
    await removeSite(request, pn);
    await seedSite(request, { plant_no: pn, name: 'DeleteMeE2E' });

    await page.goto('/sites');
    const searchInput = page.getByTestId('site-search-input');
    await searchInput.fill('DeleteMe');
    await page.getByRole('option', { name: /DeleteMeE2E/ }).click();

    await expect(page.getByTestId('site-details-card')).toContainText('DeleteMeE2E');

    // Open delete confirmation modal
    await page.getByTestId('delete-site-button').click();
    await expect(page.getByText('Are you sure you want to delete')).toBeVisible();

    // Confirm
    await page.getByTestId('confirm-delete-button').click();

    // Details card should disappear after deletion
    await expect(page.getByTestId('site-details-card')).not.toBeVisible();
  });

  test('deleted site no longer appears in search', async ({ page, request }) => {
    const pn = 'E2E004B';
    await removeSite(request, pn);
    await seedSite(request, { plant_no: pn, name: 'VanishE2E' });

    await page.goto('/sites');
    const searchInput = page.getByTestId('site-search-input');

    // Select and delete
    await searchInput.fill('VanishE2E');
    await page.getByRole('option', { name: /VanishE2E/ }).click();
    await page.getByTestId('delete-site-button').click();
    await page.getByTestId('confirm-delete-button').click();
    await expect(page.getByTestId('site-details-card')).not.toBeVisible();

    // Search again — site should be gone
    await searchInput.clear();
    await searchInput.fill('VanishE2E');
    await expect(page.getByText('No sites found')).toBeVisible();
  });
});
