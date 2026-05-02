import { test, expect } from '../fixtures'
import { resetDB } from '../helpers/db'

test.describe('Onboarding @tier1', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await resetDB(page)
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('shows onboarding modal on first boot', async ({ page }) => {
    await expect(page.getByTestId('onboarding-modal')).toBeVisible()
  })

  test('completes 3-step flow and lands on Dashboard', async ({ page }) => {
    await page.getByTestId('onboarding-name').fill('Test User')
    await page.getByTestId('onboarding-currency').fill('$')
    await page.getByTestId('onboarding-next').click()

    await page.getByTestId('onboarding-income').fill('5000')
    await expect(page.getByTestId('onboarding-slider-needs')).toBeVisible()
    await page.getByTestId('onboarding-next').click()

    await page.getByTestId('onboarding-finish').click()

    await expect(page.getByTestId('onboarding-modal')).not.toBeVisible()
    await expect(page.getByTestId('metric-income')).toBeVisible()
  })

  test('onboarding does not reappear after completion', async ({ page }) => {
    await page.getByTestId('onboarding-name').fill('Test User')
    await page.getByTestId('onboarding-currency').fill('$')
    await page.getByTestId('onboarding-next').click()
    await page.getByTestId('onboarding-income').fill('5000')
    await page.getByTestId('onboarding-next').click()
    await page.getByTestId('onboarding-finish').click()

    await page.reload({ waitUntil: 'networkidle' })
    await expect(page.getByTestId('onboarding-modal')).not.toBeVisible()
  })

  test('onboarding writes profile to IndexedDB', async ({ page }) => {
    await page.getByTestId('onboarding-name').fill('Jane Doe')
    await page.getByTestId('onboarding-currency').fill('€')
    await page.getByTestId('onboarding-next').click()
    await page.getByTestId('onboarding-income').fill('4500')
    await page.getByTestId('onboarding-next').click()
    await page.getByTestId('onboarding-finish').click()

    const profile = await page.evaluate(async () => {
      // @ts-ignore — browser-context dynamic import resolved at runtime by Vite
      const { db } = await import('/src/lib/db.ts')
      return db.profile.toCollection().first()
    })

    expect(profile?.name).toBe('Jane Doe')
    expect(profile?.currency).toBe('€')
  })
})
