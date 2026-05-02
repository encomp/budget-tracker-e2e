import { test, expect, CURRENT_MONTH, setupOnboarded } from '../fixtures'
import { seedTransactions, getCategoryId } from '../helpers/db'

test.describe('Transaction Core Loop @tier1', () => {
  test.beforeEach(async ({ page }) => {
    await setupOnboarded(page)
  })

  test('adding a transaction via UI updates Dashboard expenses', async ({
    page,
    dashboardPage,
    transactionForm,
  }) => {
    await dashboardPage.goto()
    await dashboardPage.clickAddTransaction()
    await transactionForm.waitForOpen()

    await transactionForm.fillTransaction({
      amount: '45.99',
      type: 'expense',
      category: 'Groceries',
    })
    await transactionForm.submitAndWaitForClose()

    await expect(page.getByTestId('metric-expenses')).toContainText('45.99')
  })

  test('form rejects amount of zero', async ({
    dashboardPage,
    transactionForm,
  }) => {
    await dashboardPage.goto()
    await dashboardPage.clickAddTransaction()
    await transactionForm.waitForOpen()

    await transactionForm.fillTransaction({
      amount: '0',
      category: 'Groceries',
    })
    await transactionForm.submit()

    await expect(transactionForm.modal).toBeVisible()
  })

  test('form rejects missing category', async ({
    dashboardPage,
    transactionForm,
  }) => {
    await dashboardPage.goto()
    await dashboardPage.clickAddTransaction()
    await transactionForm.waitForOpen()

    await transactionForm.amountInput.fill('25.00')
    await transactionForm.submit()

    await expect(transactionForm.modal).toBeVisible()
  })

  test('income transaction appears in income metric', async ({
    page,
    dashboardPage,
    transactionForm,
  }) => {
    await dashboardPage.goto()
    await dashboardPage.clickAddTransaction()
    await transactionForm.waitForOpen()

    await transactionForm.fillTransaction({
      amount: '3500',
      type: 'income',
      category: 'Groceries',
    })
    await transactionForm.submitAndWaitForClose()

    await expect(page.getByTestId('metric-income')).toContainText('3500')
  })

  test('IndexedDB persists transactions across hard reload', async ({ page }) => {
    const catId = await getCategoryId(page, 'Groceries', CURRENT_MONTH)
    await seedTransactions(page, [
      { amount: 45.99, type: 'expense', categoryId: catId },
      { amount: 22.50, type: 'expense', categoryId: catId },
    ])

    await page.reload({ waitUntil: 'networkidle' })
    await page.getByTestId('metric-expenses').waitFor()

    await expect(page.getByTestId('metric-expenses')).toContainText('68.49')
  })

  test('manual transaction shows "Manual" source badge', async ({
    page,
    dashboardPage,
    transactionForm,
  }) => {
    await dashboardPage.goto()
    await dashboardPage.clickAddTransaction()
    await transactionForm.waitForOpen()

    await transactionForm.fillTransaction({
      amount: '15',
      type: 'expense',
      category: 'Groceries',
    })
    await transactionForm.submitAndWaitForClose()

    await page.getByTestId('nav-transactions').click()
    await expect(
      page.getByTestId('badge-source').first()
    ).toContainText('Manual')
  })
})
