# Peer Review Checklist — Task 7F: i18n & a11y E2E Tests

## Overview
Task 7F adds two E2E spec files to the BudgetPilot E2E test suite:
- `tests/e2e/tier1/i18n-core.spec.ts` — 5 internationalization tests (TC-L01 through TC-L05)
- `tests/e2e/tier2/a11y-focus.spec.ts` — 7 accessibility tests (TC-A01 through TC-A07)

---

## File: `tests/e2e/tier1/i18n-core.spec.ts`

### Structure & Pattern Adherence
- [x] Uses `test.describe` block matching `'i18n Core @tier1'` naming convention
- [x] Uses `@tier1` tag consistent with existing tier1 specs
- [x] Imports from `../fixtures` (same pattern as all existing specs)
- [x] Uses `setupOnboarded` in `beforeEach` (consistent with csv-rules-critical.spec.ts)
- [x] Uses existing POM fixtures: `dashboardPage` (from `DashboardPage.ts`)
- [x] All `data-testid` locators match actual app source (`settings-language-select`, `nav-transactions`, `nav-settings`, `nav-dashboard`)

### Test Coverage
- [x] **TC-L01**: Switches to Español, verifies `nav-transactions` = "Transacciones" and income card = "Ingresos"
- [x] **TC-L02**: Switches to Français, verifies nav renders and `metric-income` card = "Revenus"
- [x] **TC-L03**: Switches to Spanish, calls `page.reload()`, re-checks `nav-transactions` for "Transacciones"
- [x] **TC-L04**: Sets € as currency symbol, switches to French, navigates to Dashboard, verifies € appears in metric values
- [x] **TC-L05**: Switches to Spanish, checks `role="columnheader"` elements in `heatmap-calendar`, asserts they don't all match English weekday abbreviations

### Correctness
- [x] Uses `page.waitForFunction` to poll for i18n state instead of fragile `waitForTimeout`
- [x] TC-L05 uses a negative assertion (not all English) which is locale-stable and doesn't hardcode abbreviations that vary by browser engine
- [x] `dashboardPage.heatmapGrid` maps to `data-testid="heatmap-calendar"` which exists in `DashboardPage.ts`
- [x] Language select options found via `getByRole('option', { name: /español/i })` — case-insensitive, robust

---

## File: `tests/e2e/tier2/a11y-focus.spec.ts`

### Structure & Pattern Adherence
- [x] Uses `test.describe` block with `@tier2` tag
- [x] Imports from `../fixtures`
- [x] Uses `setupOnboarded` in `beforeEach`
- [x] Uses existing POM fixtures: `dashboardPage`, `themeGallery`
- [x] `LOW_CONTRAST_THEME` constant defined inline (no separate file) as specified

### Test Coverage
- [x] **TC-A01**: Opens transaction modal via `dashboardPage.clickAddTransaction()`, tabs 10 times, verifies focus stays inside `[data-testid="transaction-modal"]` via `page.evaluate`
- [x] **TC-A02**: Opens dialog, presses `Escape`, waits for `state: 'hidden'`
- [x] **TC-A03**: Navigates to Budget page, finds `role="progressbar"`, checks `aria-valuemin="0"`, `aria-valuemax="100"`, numeric `aria-valuenow`, and non-empty `aria-label`
- [x] **TC-A04**: Verifies full grid ARIA hierarchy: `role="grid"` > `role="row"` > `role="gridcell"` (with `aria-label`) + `role="columnheader"` — all scoped to `data-testid="heatmap-calendar"`
- [x] **TC-A05**: Calls `page.emulateMedia({ reducedMotion: 'reduce' })`, navigates between pages, verifies no crash and dashboard still visible
- [x] **TC-A06**: Iterates visible buttons on Transactions page; any with empty text must have `aria-label` or `aria-labelledby`; collects violations and asserts empty array
- [x] **TC-A07**: Uploads `LOW_CONTRAST_THEME` via `page.getByTestId('theme-dropzone').setInputFiles(...)` with Buffer, waits for preview panel, verifies `data-testid="theme-contrast-warning"` is visible

### Correctness
- [x] Theme upload uses `data-testid="theme-dropzone"` which maps to the hidden `<input type="file">` in `Settings.tsx` (line 603)
- [x] `LOW_CONTRAST_THEME` tokens include `--bp-text-primary: '#cccccc'` on `--bp-bg-base: '#f0f0f0'` — contrast ratio ~1.5:1, well below WCAG AA 4.5:1 threshold, guarantees warning fires
- [x] TC-A01 focus-trap check uses `dialog.contains(focused)` to handle all focusable element types
- [x] TC-A06 collects all violations before asserting, giving helpful output on failure

### TypeScript
- [x] `npx tsc --noEmit` passes with zero errors
- [x] `Buffer.from(...)` is available (`@types/node` is in devDependencies)

### Test Registration
- [x] `npx playwright test tests/e2e/tier1/i18n-core.spec.ts --list` → 25 tests (5 × 5 browser projects)
- [x] `npx playwright test tests/e2e/tier2/a11y-focus.spec.ts --list` → 7 tests (1 × chromium-tier2 project)

---

## Branch & Merge
- [x] Created branch `feat/phase7-i18n-a11y-e2e` from `main`
- [x] Files committed on feature branch
- [x] Merged to `main` with `--no-ff`

---

## Overall: PASS — All checklist items verified ✓
