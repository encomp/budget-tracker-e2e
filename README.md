# BudgetPilot E2E Tests

Playwright E2E test suite for [BudgetPilot](https://github.com/encomp/budget-tracker).

## Structure

```
tests/e2e/
  helpers/db.ts        # Dexie seeding helpers (runs in browser context)
  pages/               # Page Object Models
  fixtures.ts          # Shared test fixtures and CSV data
  fixtures/themes.ts   # Theme JSON fixtures
  tier1/               # Critical path — all 5 browsers
  tier2/               # Regression — Chromium only
```

## Running locally

1. Build the app and place `dist/` in the root of this repo:
   ```bash
   # In the budget-tracker repo:
   npm run build
   cp -r dist/ ../budget-tracker-e2e/dist/
   ```

2. Install dependencies:
   ```bash
   npm ci
   npx playwright install --with-deps
   ```

3. Run Tier 1 tests:
   ```bash
   npm run test:tier1
   ```

## CI

Tests run automatically via GitHub Actions on every push to `main`.

### Required secrets

| Secret | Description |
|---|---|
| `APP_REPO_TOKEN` | Fine-grained PAT with `actions:read` on `encomp/budget-tracker` |

To create the token:
1. GitHub → Settings → Developer settings → Fine-grained personal access tokens
2. Repository access: Only `encomp/budget-tracker`
3. Permissions: Actions → Read-only
4. Copy token → add as `APP_REPO_TOKEN` secret in `encomp/budget-tracker-e2e`

## Tier structure

| Tier | Browsers | Tests | Purpose |
|---|---|---|---|
| 1 | chromium, firefox, webkit, mobile-chrome, mobile-safari | 26 | Critical path |
| 2 | chromium only | 15 | Regression, edge cases |
