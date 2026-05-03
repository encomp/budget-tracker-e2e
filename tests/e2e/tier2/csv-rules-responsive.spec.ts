import { test, expect, setupOnboarded } from '../fixtures'

test.describe('CSV Rules Responsive @tier2', () => {
  test.beforeEach(async ({ page }) => {
    await setupOnboarded(page)
  })

  // TC-30: Desktop — table layout with text action buttons
  test('desktop layout shows table with text action buttons', async ({
    page,
    importRulesPage,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await importRulesPage.goto()
    await importRulesPage.addRule('netflix', 'Entertainment')

    await expect(
      page.locator('table, [role="table"]')
    ).toBeVisible()
  })

  // TC-31: Tablet — icon-only buttons
  test('tablet layout shows icon-only action buttons', async ({
    page,
    importRulesPage,
  }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await importRulesPage.goto()
    await importRulesPage.addRule('netflix', 'Entertainment')

    const rows = importRulesPage.list
      .locator('[data-testid^="import-rule-row-"]')
    const editBtn = rows.first().locator('[data-testid^="import-rule-edit-"]')
    const editText = await editBtn.textContent()
    expect(editText?.trim().length).toBeLessThanOrEqual(2)
  })

  // TC-32: Mobile — card list (Tier 2, Chromium, no long-press assertion)
  test('mobile layout shows card list instead of table', async ({
    page,
    importRulesPage,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await importRulesPage.goto()
    await importRulesPage.addRule('netflix', 'Entertainment')

    await expect(
      page.locator('table, [role="table"]')
    ).not.toBeVisible()
    await expect(
      importRulesPage.list.locator('[data-testid^="import-rule-row-"]')
    ).toBeVisible()
  })
})
