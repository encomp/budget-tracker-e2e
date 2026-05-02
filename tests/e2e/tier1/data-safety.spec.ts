import { test, expect, CURRENT_MONTH, setupOnboarded } from '../fixtures'
import { seedTransactions, getCategoryId, seedOnboardedState } from '../helpers/db'
import path from 'path'
import os from 'os'
import fs from 'fs'

test.describe('Data Safety @tier1', () => {
  test.beforeEach(async ({ page }) => {
    await setupOnboarded(page)
  })

  test('export → clear → import restores all transactions', async ({ page }) => {
    const catId = await getCategoryId(page, 'Groceries', CURRENT_MONTH)
    await seedTransactions(page, [
      { amount: 45.99, type: 'expense', categoryId: catId },
      { amount: 22.50, type: 'expense', categoryId: catId },
      { amount: 3500,  type: 'income',  categoryId: catId },
    ])

    await page.getByTestId('nav-export-import').click()
    const downloadPromise = page.waitForEvent('download')
    await page.getByTestId('export-button').click()
    const download = await downloadPromise
    const exportPath = path.join(os.tmpdir(), download.suggestedFilename())
    await download.saveAs(exportPath)
    expect(fs.existsSync(exportPath)).toBe(true)

    await page.getByTestId('nav-settings').click()
    await page.getByTestId('danger-clear-data').click()
    // Clear triggers window.location.reload() — wait for that navigation to settle
    await Promise.all([
      page.waitForEvent('framenavigated'),
      page.getByRole('button', { name: /delete everything/i }).click(),
    ])
    await page.waitForLoadState('networkidle')

    const countAfterClear = await page.evaluate(async () => {
      try {
        // @ts-ignore — browser-context dynamic import resolved at runtime by Vite
        const { db } = await import('/src/lib/db.ts')
        return await db.transactions.count()
      } catch {
        return 0
      }
    })
    expect(countAfterClear).toBe(0)

    // App shows onboarding after clear — seed state to bypass it
    await seedOnboardedState(page)
    await page.getByTestId('nav-export-import').click()
    await page.setInputFiles(
      '[data-testid="restore-file-input"]',
      exportPath
    )
    await page.getByTestId('restore-confirm-modal').waitFor()
    await page.getByRole('button', { name: /restore/i }).click()
    await page.waitForLoadState('networkidle')

    const countAfterRestore = await page.evaluate(async () => {
      // @ts-ignore — browser-context dynamic import resolved at runtime by Vite
      const { db } = await import('/src/lib/db.ts')
      return db.transactions.count()
    })
    expect(countAfterRestore).toBe(3)

    fs.unlinkSync(exportPath)
  })

  test('IndexedDB survives hard reload', async ({ page }) => {
    const catId = await getCategoryId(page, 'Groceries', CURRENT_MONTH)
    await seedTransactions(page, [
      { amount: 99.99, type: 'expense', categoryId: catId },
    ])

    await page.reload({ waitUntil: 'networkidle' })

    const count = await page.evaluate(async () => {
      // @ts-ignore — browser-context dynamic import resolved at runtime by Vite
      const { db } = await import('/src/lib/db.ts')
      return db.transactions.count()
    })
    expect(count).toBe(1)
  })

  test("export filename includes today's date", async ({ page }) => {
    await page.getByTestId('nav-export-import').click()
    const downloadPromise = page.waitForEvent('download')
    await page.getByTestId('export-button').click()
    const download = await downloadPromise

    const today = new Date().toISOString().slice(0, 10)
    expect(download.suggestedFilename()).toContain(today)
    expect(download.suggestedFilename()).toContain('budgetpilot-backup')
  })
})
