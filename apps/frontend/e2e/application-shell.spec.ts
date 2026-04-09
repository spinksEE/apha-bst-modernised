import { test, expect } from '@playwright/test';

/**
 * FT-007: Application Shell — Playwright Acceptance Tests
 *
 * Covers three user stories:
 *   US-071: Application Shell and Dashboard
 *   US-072: Global Navigation Structure
 *   US-073: Generic Application Error Page (not-found variant; error boundary covered by unit tests)
 *
 * Tests run against the live dev stack (frontend :3000).
 */

// ============================================================================
// US-071: Application Shell and Dashboard
// ============================================================================
test.describe('US-071: Application Shell and Dashboard', () => {
  test('AC1: base URL renders dashboard with announcements, quick-actions, and user context', async ({
    page,
  }) => {
    await page.goto('/');

    // Dashboard heading
    await expect(page.getByRole('heading', { name: 'Dashboard', level: 1 })).toBeVisible();

    // System Announcements section
    await expect(page.getByRole('heading', { name: 'System Announcements' })).toBeVisible();
    await expect(page.getByText('Welcome to the APHA Brainstem Training Schedule system')).toBeVisible();

    // Quick Navigation section
    await expect(page.getByRole('heading', { name: 'Quick Navigation' })).toBeVisible();

    // All five quick-action cards present
    await expect(page.getByRole('link', { name: 'View Sites' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Register Site' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Record Training' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Manage Trainers' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Add Person' })).toBeVisible();

    // User context in header (BR-071)
    await expect(page.getByText('Hello, Smith, J (Supv)')).toBeVisible();

    // APHA BST branding
    await expect(page.getByRole('banner')).toContainText('APHA BST');
  });

  test('AC2: quick-action links resolve to valid pages, no dead ends', async ({ page }) => {
    await page.goto('/');

    // Click "View Sites" quick-action → should navigate to /sites
    await page.getByRole('link', { name: 'View Sites' }).click();
    await expect(page).toHaveURL(/\/sites/);
    // Page should render content (not blank or error)
    await expect(page.getByRole('main')).not.toBeEmpty();

    // Go back to dashboard via Home nav link
    await page.goto('/');

    // Click "Register Site" → should navigate to /sites/register
    await page.getByRole('link', { name: 'Register Site' }).click();
    await expect(page).toHaveURL(/\/sites\/register/);
    await expect(page.getByRole('main')).not.toBeEmpty();

    await page.goto('/');

    // Click "Record Training" → should navigate to /training/add
    await page.getByRole('link', { name: 'Record Training' }).click();
    await expect(page).toHaveURL(/\/training\/add/);
    await expect(page.getByRole('main')).not.toBeEmpty();

    await page.goto('/');

    // Click "Manage Trainers" → should navigate to /trainers
    await page.getByRole('link', { name: 'Manage Trainers' }).click();
    await expect(page).toHaveURL(/\/trainers/);
    await expect(page.getByRole('main')).not.toBeEmpty();

    await page.goto('/');

    // Click "Add Person" → should navigate to /persons/add
    await page.getByRole('link', { name: 'Add Person' }).click();
    await expect(page).toHaveURL(/\/persons\/add/);
    await expect(page.getByRole('main')).not.toBeEmpty();
  });

  test('AC3: footer visible on dashboard, sites page, and training page', async ({ page }) => {
    const footerText = 'APHA BST System v2.0 POC | Crown Copyright 2026';

    // Dashboard
    await page.goto('/');
    await expect(page.getByRole('contentinfo')).toContainText(footerText);

    // Sites page
    await page.goto('/sites');
    await expect(page.getByRole('contentinfo')).toContainText(footerText);

    // Training page
    await page.goto('/training/add');
    await expect(page.getByRole('contentinfo')).toContainText(footerText);
  });
});

// ============================================================================
// US-072: Global Navigation Structure
// ============================================================================
test.describe('US-072: Global Navigation Structure', () => {
  test('AC1: nav bar persists when navigating to sites page', async ({ page }) => {
    await page.goto('/sites');

    // Nav bar with landmark
    const nav = page.getByRole('navigation', { name: 'Main navigation' });
    await expect(nav).toBeVisible();

    // Home link present
    await expect(nav.getByRole('link', { name: 'Home' })).toBeVisible();

    // Dropdown triggers present
    await expect(nav.getByRole('button', { name: /Brainstem/ })).toBeVisible();
    await expect(nav.getByRole('button', { name: /Sites/ })).toBeVisible();
  });

  test('AC2: Brainstem dropdown expands with correct links', async ({ page }) => {
    await page.goto('/');

    // Click to open Brainstem dropdown
    await page.getByRole('button', { name: /Brainstem/ }).click();

    // Verify menu items
    await expect(page.getByRole('menuitem', { name: 'Add Training' })).toBeVisible();
    await expect(page.getByRole('menuitem', { name: 'Manage Trainers' })).toBeVisible();

    // Click "Add Training" → navigates correctly
    await page.getByRole('menuitem', { name: 'Add Training' }).click();
    await expect(page).toHaveURL(/\/training\/add/);
  });

  test('AC2: Sites dropdown expands with correct links', async ({ page }) => {
    await page.goto('/');

    // Click to open Sites dropdown
    await page.getByRole('button', { name: /Sites/ }).click();

    // Verify menu items
    await expect(page.getByRole('menuitem', { name: 'View All Sites' })).toBeVisible();
    await expect(page.getByRole('menuitem', { name: 'Add New Site' })).toBeVisible();
    await expect(page.getByRole('menuitem', { name: 'Add Person' })).toBeVisible();

    // Click "View All Sites" → navigates correctly
    await page.getByRole('menuitem', { name: 'View All Sites' }).click();
    await expect(page).toHaveURL(/\/sites/);
  });

  test('AC3: clicking "Home" from any page returns to dashboard', async ({ page }) => {
    // Navigate away from dashboard
    await page.goto('/sites');
    await expect(page).toHaveURL(/\/sites/);

    // Click "Home" in the nav bar
    const nav = page.getByRole('navigation', { name: 'Main navigation' });
    await nav.getByRole('link', { name: 'Home' }).click();

    // Should be back at dashboard
    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { name: 'Dashboard', level: 1 })).toBeVisible();
  });

  test('AC3: APHA BST header link also returns to dashboard', async ({ page }) => {
    await page.goto('/trainers');

    // Click the APHA BST branding link in the header
    await page.getByRole('banner').getByRole('link', { name: 'APHA BST' }).click();

    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { name: 'Dashboard', level: 1 })).toBeVisible();
  });
});

// ============================================================================
// US-073: Application Error Page (not-found variant)
// ============================================================================
test.describe('US-073: Application Error Page', () => {
  test('AC2: not-found page preserves shell (NFR-071)', async ({ page }) => {
    await page.goto('/does-not-exist');

    // Not-found page content
    await expect(page.getByRole('heading', { name: 'Page not found', level: 1 })).toBeVisible();
    await expect(page.getByText('If you typed the web address, check it is correct')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Return to Home Dashboard' })).toBeVisible();

    // Shell is preserved — header, nav, footer all visible
    await expect(page.getByRole('banner')).toContainText('APHA BST');
    await expect(page.getByText('Hello, Smith, J (Supv)')).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeVisible();
    await expect(page.getByRole('contentinfo')).toContainText('APHA BST System v2.0 POC');
  });

  test('NFR-071: not-found page has a working "Return to Home" link', async ({ page }) => {
    await page.goto('/completely/unknown/path');

    // Page should render, not be blank
    await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();

    // Click return link → back to dashboard
    await page.getByRole('link', { name: 'Return to Home Dashboard' }).click();
    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { name: 'Dashboard', level: 1 })).toBeVisible();
  });
});
