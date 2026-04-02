# Acceptance Testing & Dev-Browser Verification

When building features with frontend user interaction (forms, buttons, navigation), two verification steps are required:

## 1. Dev-browser verification (RALPH loop backpressure)

Use `dev-browser --headless` to verify the feature works in a real browser **before marking the task complete**. This is a blocking gate — if it fails, the task is not done.

```bash
dev-browser --headless <<'EOF'
const page = await browser.getPage("main");
await page.goto("http://localhost:3000/some-feature");
await page.locator('[data-testid="submit-button"]').click();
await page.waitForSelector('[data-testid="success-message"]');
console.log("Verification passed");
EOF
```

- Run against the Dockerised app at `http://localhost:3000` — ensure containers are healthy first
- On failure: inspect with `page.snapshotForAI()`, fix the implementation, re-verify
- Use the same assertions you'll put in the Playwright test — this is a rapid feedback step

## 2. Playwright acceptance tests (permanent, CI-runnable)

Every interactive feature must have a Playwright test in `apps/frontend/e2e/`.

```typescript
// apps/frontend/e2e/some-feature.spec.ts
import { test, expect } from '@playwright/test';

test('user can submit form and see success', async ({ page }) => {
  await page.goto('/some-feature');
  await page.getByRole('button', { name: 'Submit' }).click();
  await expect(page.getByText('Success')).toBeVisible();
});
```

- Tests must run via `pnpm exec playwright test` and must not depend on dev-browser
- Use accessible selectors (roles, data-testid, text) — not brittle CSS classes
- Group tests by user journey (e.g. `login.spec.ts`, `record-management.spec.ts`)

## When to skip

- Change is purely visual/static content → no acceptance test needed
- Backend-only change with no UI impact → no acceptance test needed
- Refactor with no behaviour change → existing tests cover it
