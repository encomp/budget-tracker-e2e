import { test, expect, setupOnboarded } from '../fixtures'
import { seedDebts } from '../helpers/db'

test.describe('Debt Snowball @tier2', () => {
  test.beforeEach(async ({ page }) => {
    await setupOnboarded(page)
    await seedDebts(page, [
      { name: 'Visa',     balance: 3000, apr: 19.99, minPayment: 60  },
      { name: 'Car Loan', balance: 8500, apr: 6.5,   minPayment: 200 },
    ])
    await page.getByTestId('nav-debts').click()
    await page.waitForLoadState('networkidle')
  })

  test('snowball orders lowest balance first', async ({ page }) => {
    await page.getByTestId('method-toggle-snowball').click()
    const firstCard = page
      .getByTestId('debt-list')
      .locator('[data-testid^="debt-card-"]')
      .first()
    await expect(firstCard).toContainText('Visa')
  })

  test('avalanche orders highest APR first', async ({ page }) => {
    await page.getByTestId('method-toggle-avalanche').click()
    const firstCard = page
      .getByTestId('debt-list')
      .locator('[data-testid^="debt-card-"]')
      .first()
    await expect(firstCard).toContainText('Visa')
  })

  test('moving extra payment slider changes interest-saved value', async ({
    page,
  }) => {
    const before = await page
      .getByTestId('interest-saved-value')
      .textContent()

    await page.getByTestId('debt-slider').fill('300')

    const after = await page
      .getByTestId('interest-saved-value')
      .textContent()

    expect(before).not.toEqual(after)
  })

  test('moving slider updates debt-free date', async ({ page }) => {
    const before = await page.getByTestId('debt-free-date').textContent()
    await page.getByTestId('debt-slider').fill('500')
    const after = await page.getByTestId('debt-free-date').textContent()
    expect(before).not.toEqual(after)
  })

  test('empty state shows when no debts exist', async ({ page }) => {
    await page.evaluate(async () => {
      // @ts-ignore — browser-context dynamic import resolved at runtime by Vite
      const { db } = await import('/src/lib/db.ts')
      await db.debts.clear()
    })
    await page.reload({ waitUntil: 'networkidle' })
    await page.getByTestId('nav-debts').click()

    await expect(page.getByTestId('empty-state')).toBeVisible()
  })
})
