import { test, expect, CURRENT_MONTH, setupOnboarded } from '../fixtures'
import { seedTransactions, getCategoryId } from '../helpers/db'

test.describe('Uncategorized Transactions @tier2', () => {
  test.beforeEach(async ({ page }) => {
    await setupOnboarded(page)
    await seedTransactions(page, [
      { amount: 23.50, type: 'expense', categoryId: null },
    ])
    await page.getByTestId('nav-transactions').click()
    await page.waitForLoadState('networkidle')
  })

  test('uncategorized row shows amber badge', async ({ page }) => {
    await expect(
      page.getByTestId('badge-uncategorized').first()
    ).toBeVisible()
  })

  test('assigning category removes the uncategorized badge', async ({
    page,
  }) => {
    await page.getByTestId('transaction-row').first().click()
    await page.getByTestId('transaction-modal').waitFor({ state: 'visible' })

    await page.getByTestId('txn-category').click()
    await page.getByRole('option', { name: 'Groceries' }).click()
    await page.getByTestId('txn-save').click()
    await page.getByTestId('transaction-modal').waitFor({ state: 'hidden' })

    await expect(page.getByTestId('badge-uncategorized')).not.toBeVisible()
  })

  test('assigning category writes to csvCategoryMap', async ({ page }) => {
    await page.getByTestId('transaction-row').first().click()
    await page.getByTestId('transaction-modal').waitFor({ state: 'visible' })

    await page.getByTestId('txn-category').click()
    await page.getByRole('option', { name: 'Groceries' }).click()
    await page.getByTestId('txn-save').click()
    await page.getByTestId('transaction-modal').waitFor({ state: 'hidden' })

    const mapCount = await page.evaluate(async () => {
      // @ts-ignore — browser-context dynamic import resolved at runtime by Vite
      const { db } = await import('/src/lib/db.ts')
      return db.csvCategoryMap.count()
    })
    expect(mapCount).toBeGreaterThan(0)
  })
})
