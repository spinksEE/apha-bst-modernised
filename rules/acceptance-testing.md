# Acceptance Testing

When building features with frontend user interaction (forms, buttons, navigation), verification steps are required:

## Playwright acceptance tests (permanent, CI-runnable)

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
