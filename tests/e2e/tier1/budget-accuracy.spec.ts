import { test, expect, CURRENT_MONTH, setupOnboarded } from '../fixtures'
import {
  seedTransactions,
  seedBudgetWithLimits,
  getCategoryId,
} from '../helpers/db'

test.describe('Budget Accuracy @tier1', () => {
  test.beforeEach(async ({ page }) => {
    await setupOnboarded(page, { monthlyIncome: 5000 })
  })

  test('progress bar aria-valuenow reflects spend percentage', async ({
    page,
  }) => {
    const catId = await getCategoryId(page, 'Groceries', CURRENT_MONTH)
    await seedBudgetWithLimits(page, CURRENT_MONTH, [
      { categoryName: 'Groceries', limit: 400 },
    ])
    await seedTransactions(page, [
      { amount: 200, type: 'expense', categoryId: catId },
    ])

    await page.getByTestId('nav-budget').click()
    await page.waitForLoadState('networkidle')

    const bar = page.getByTestId(`progress-bar-${catId}`)
    const value = await bar.getAttribute('aria-valuenow')
    expect(Number(value)).toBeCloseTo(50, 0)
  })

  test('allocation sliders sum to 100 after moving needs slider', async ({
    page,
  }) => {
    await page.getByTestId('nav-budget').click()
    await page.waitForLoadState('networkidle')

    await page.getByTestId('slider-needs').fill('60')

    const needs   = await page.getByTestId('allocation-value-needs').textContent()
    const wants   = await page.getByTestId('allocation-value-wants').textContent()
    const savings = await page.getByTestId('allocation-value-savings').textContent()

    const parse = (s: string | null) =>
      parseFloat(s?.replace('%', '') ?? '0')

    expect(parse(needs) + parse(wants) + parse(savings)).toBeCloseTo(100, 0)
  })

  test('dashboard savings rate updates when income and expenses change', async ({
    page,
  }) => {
    const catId = await getCategoryId(page, 'Groceries', CURRENT_MONTH)
    await seedTransactions(page, [
      { amount: 5000, type: 'income',  categoryId: catId },
      { amount: 2500, type: 'expense', categoryId: catId },
    ])

    await page.getByTestId('nav-dashboard').click()
    await page.waitForLoadState('networkidle')

    await expect(page.getByTestId('metric-savings-rate')).toContainText('50')
  })
})
