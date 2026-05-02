import { test, expect, setupOnboarded, AMEX_3COL_CSV } from '../fixtures'

test.describe('CSV Rules Manager @tier2', () => {
  test.beforeEach(async ({ page }) => {
    await setupOnboarded(page)
  })

  // TC-08: Toggle only appears after category assigned
  test('save-as-rule toggle appears only after category is assigned', async ({
    page,
    importPage,
  }) => {
    await importPage.goto()
    await importPage.uploadCSV(AMEX_3COL_CSV, 'amex.csv')
    await importPage.previewTable.waitFor()

    await expect(
      page.getByTestId('import-rule-toggle-0')
    ).not.toBeVisible()

    await importPage.assignCategoryToRow(0, 'Dining Out')
    await expect(
      page.getByTestId('import-rule-toggle-0')
    ).toBeVisible()
  })

  // TC-09: Rule key auto-derived from description
  test('rule key auto-derives first two meaningful words from description', async ({
    importPage,
  }) => {
    await importPage.goto()
    await importPage.uploadCSV(AMEX_3COL_CSV, 'amex.csv')
    await importPage.previewTable.waitFor()
    await importPage.assignCategoryToRow(0, 'Dining Out')

    // Description is "ANTHROPIC SAN FRANCISCO CA"
    // Expected key: "anthropic san" (first two words > 2 chars, lowercased)
    const key = await importPage.getRuleKeyForRow(0)
    expect(key?.toLowerCase()).toBe('anthropic san')
  })

  // TC-10: Rule key editable inline
  test('rule key can be edited inline before import', async ({
    importPage,
  }) => {
    await importPage.goto()
    await importPage.uploadCSV(AMEX_3COL_CSV, 'amex.csv')
    await importPage.previewTable.waitFor()
    await importPage.assignCategoryToRow(0, 'Dining Out')
    await importPage.setRuleKeyForRow(0, 'anthropic')

    const key = await importPage.getRuleKeyForRow(0)
    expect(key).toBe('anthropic')
  })

  // TC-11: Unchecking toggle decrements counter
  test('unchecking rule toggle decrements rule count summary', async ({
    importPage,
  }) => {
    await importPage.goto()
    await importPage.uploadCSV(AMEX_3COL_CSV, 'amex.csv')
    await importPage.previewTable.waitFor()

    await importPage.assignCategoryToRow(0, 'Dining Out')
    await importPage.assignCategoryToRow(1, 'Groceries')

    const summaryBefore = await importPage.getRuleCountSummaryText()
    expect(summaryBefore).toContain('2 rules')

    await importPage.toggleRuleForRow(0, false)

    const summaryAfter = await importPage.getRuleCountSummaryText()
    expect(summaryAfter).toContain('1 rule')
  })

  // TC-19: Add rule from empty state
  test('add rule from empty state using + Add your first rule', async ({
    importRulesPage,
  }) => {
    await importRulesPage.goto()
    await expect(importRulesPage.emptyState).toBeVisible()

    await importRulesPage.addRule('spotify', 'Entertainment')

    expect(await importRulesPage.getRuleCount()).toBe(1)
    await expect(importRulesPage.emptyState).not.toBeVisible()
  })

  // TC-21: Save disabled until keyword (≥2 chars) + category both filled
  test('add rule Save button disabled until both fields filled', async ({
    page,
    importRulesPage,
  }) => {
    await importRulesPage.goto()
    await importRulesPage.addButton.click()
    await importRulesPage.addForm.waitFor({ state: 'visible' })

    await expect(importRulesPage.addSaveButton).toBeDisabled()

    await importRulesPage.addKeywordInput.fill('ne')
    await expect(importRulesPage.addSaveButton).toBeDisabled()

    await importRulesPage.addCategorySelect.click()
    await page.getByRole('option', { name: 'Entertainment' }).click()
    await expect(importRulesPage.addSaveButton).toBeEnabled()
  })

  // TC-22: Duplicate keyword shows overwrite warning
  test('duplicate keyword shows overwrite warning with existing category name', async ({
    importRulesPage,
  }) => {
    await importRulesPage.goto()
    await importRulesPage.addRule('netflix', 'Entertainment')

    await importRulesPage.addButton.click()
    await importRulesPage.addKeywordInput.fill('netflix')

    await expect(importRulesPage.duplicateWarning).toBeVisible()
    await expect(importRulesPage.duplicateWarning).toContainText('Entertainment')
  })

  // TC-26: Navigate away before 10s commits delete permanently
  test('navigating away before undo window commits bulk delete', async ({
    page,
    importRulesPage,
  }) => {
    await importRulesPage.goto()
    await importRulesPage.addRule('netflix', 'Entertainment')
    await importRulesPage.addRule('amazon', 'Shopping')

    await importRulesPage.selectRuleByIndex(0)
    await importRulesPage.bulkDeleteButton.click()

    await page.getByTestId('nav-dashboard').click()
    await page.waitForTimeout(500)

    await importRulesPage.goto()

    expect(await importRulesPage.getRuleCount()).toBe(1)
  })

  // TC-27: Search filters rules in real time
  test('search filters rules list in real time', async ({
    importRulesPage,
  }) => {
    await importRulesPage.goto()
    await importRulesPage.addRule('netflix', 'Entertainment')
    await importRulesPage.addRule('amazon', 'Shopping')
    await importRulesPage.addRule('starbucks', 'Dining Out')

    await importRulesPage.search('net')
    expect(await importRulesPage.getRuleCount()).toBe(1)

    await importRulesPage.clearSearch()
    expect(await importRulesPage.getRuleCount()).toBe(3)
  })
})
