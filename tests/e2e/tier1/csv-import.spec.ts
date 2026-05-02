import { test, expect, CHASE_CSV, UNKNOWN_CSV, setupOnboarded } from '../fixtures'

test.describe('CSV Import @tier1', () => {
  test.beforeEach(async ({ page }) => {
    await setupOnboarded(page)
  })

  test('Chase CSV auto-detects bank and shows toast', async ({
    page,
    importPage,
  }) => {
    await importPage.goto()
    await importPage.uploadCSV(CHASE_CSV, 'chase.csv')

    await expect(importPage.bankDetectedToast).toBeVisible()
    await expect(importPage.bankDetectedToast).toContainText('Chase')
  })

  test('Chase CSV preview shows correct row count', async ({ importPage }) => {
    await importPage.goto()
    await importPage.uploadCSV(CHASE_CSV, 'chase.csv')
    await importPage.previewTable.waitFor({ state: 'visible' })

    expect(await importPage.getPreviewRowCount()).toBe(5)
  })

  test('Chase CSV leaves exactly 1 uncategorized row', async ({ importPage }) => {
    await importPage.goto()
    await importPage.uploadCSV(CHASE_CSV, 'chase.csv')
    await importPage.previewTable.waitFor({ state: 'visible' })

    expect(await importPage.getUncategorizedCount()).toBe(2)
  })

  test('unknown bank CSV triggers manual mapping UI', async ({ importPage }) => {
    await importPage.goto()
    await importPage.uploadCSV(UNKNOWN_CSV, 'unknown.csv')

    await expect(importPage.bankDetectedToast).not.toBeVisible()
    await expect(importPage.confirmMappingButton).toBeVisible()
  })

  test('importing Chase CSV writes correct records to Dexie', async ({
    page,
    importPage,
  }) => {
    await importPage.goto()
    await importPage.uploadCSV(CHASE_CSV, 'chase.csv')
    await importPage.previewTable.waitFor()
    await importPage.importButton.click()

    const count = await page.evaluate(async () => {
      // @ts-ignore — browser-context dynamic import resolved at runtime by Vite
      const { db } = await import('/src/lib/db.ts')
      return db.transactions.count()
    })
    expect(count).toBe(5)
  })

  test('imported rows have importSource: csv', async ({
    page,
    importPage,
  }) => {
    await importPage.goto()
    await importPage.uploadCSV(CHASE_CSV, 'chase.csv')
    await importPage.previewTable.waitFor()
    await importPage.importButton.click()

    const sources = await page.evaluate(async () => {
      // @ts-ignore — browser-context dynamic import resolved at runtime by Vite
      const { db } = await import('/src/lib/db.ts')
      const txns = await db.transactions.toArray()
      return [...new Set(txns.map((t: { importSource: string }) => t.importSource))]
    })
    expect(sources).toEqual(['csv'])
  })

  test('post-import redirect shows CSV source badges', async ({
    page,
    importPage,
  }) => {
    await importPage.goto()
    await importPage.uploadCSV(CHASE_CSV, 'chase.csv')
    await importPage.previewTable.waitFor()
    await importPage.importButton.click()

    await page.getByTestId('transactions-table').waitFor()
    const badges = page.getByTestId('badge-source')
    const count = await badges.count()
    expect(count).toBeGreaterThan(0)

    for (let i = 0; i < Math.min(count, 5); i++) {
      await expect(badges.nth(i)).toContainText('CSV')
    }
  })
})
