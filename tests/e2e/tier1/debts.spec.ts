import { test, expect } from '@playwright/test'
import { resetDB, seedOnboardedState, seedDebts } from '../helpers/db'

// Regression tests covering the v1.0.0 launch bugs in the Debts feature:
//   1. Unpayable-at-minimum debts surfaced as "May 2076" with no warning.
//   2. Interest Saved compounded runaway interest into multi-million dollar
//      values when any debt was unpayable.
//   3. Snowball/Avalanche toggle visually flips the active button.
//   4. Extra Monthly Payment slider has non-zero rendered dimensions.
test.describe('Debts page — v1.0.0 regression tests @tier1', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await resetDB(page)
    await seedOnboardedState(page)
  })

  test('renders the Debts page header without errors', async ({ page }) => {
    await seedDebts(page, [
      { name: 'Visa', balance: 5000, apr: 24.99, minPayment: 100 },
      { name: 'Auto Loan', balance: 15000, apr: 7.99, minPayment: 300 },
    ])
    await page.reload({ waitUntil: 'networkidle' })
    await page.goto('/#/debts')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })

  test('Snowball/Avalanche toggle visually flips the active button', async ({ page }) => {
    await seedDebts(page, [
      { name: 'Visa', balance: 5000, apr: 24.99, minPayment: 100 },
      { name: 'Auto Loan', balance: 15000, apr: 7.99, minPayment: 300 },
    ])
    await page.goto('/#/debts')

    const snowball = page.getByTestId('method-toggle-snowball')
    const avalanche = page.getByTestId('method-toggle-avalanche')
    await expect(snowball).toBeVisible()
    await expect(avalanche).toBeVisible()

    const snowballBefore = await snowball.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor
    )
    const avalancheBefore = await avalanche.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor
    )
    // Snowball is the default; the two buttons should already differ.
    expect(snowballBefore).not.toBe(avalancheBefore)

    await avalanche.click()
    const snowballAfter = await snowball.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor
    )
    expect(snowballAfter).not.toBe(snowballBefore)
  })

  test('Extra Monthly Payment slider has non-zero rendered dimensions', async ({ page }) => {
    await seedDebts(page, [
      { name: 'Visa', balance: 5000, apr: 24.99, minPayment: 100 },
      { name: 'Auto Loan', balance: 15000, apr: 7.99, minPayment: 300 },
    ])
    await page.goto('/#/debts')

    // The slider may live in any of the responsive layouts; pick the first.
    const slider = page
      .locator('.bp-slider-premium, .bp-slider-standard, [data-slot="slider"]')
      .first()
    await expect(slider).toBeVisible()

    const box = await slider.boundingBox()
    expect(box).not.toBeNull()
    expect(box!.width).toBeGreaterThan(50)
    expect(box!.height).toBeGreaterThan(0)

    const track = slider.locator('[data-slot="slider-track"]').first()
    const trackBox = await track.boundingBox()
    expect(trackBox).not.toBeNull()
    expect(trackBox!.height).toBeGreaterThan(0)

    const thumb = slider.locator('[data-slot="slider-thumb"]').first()
    const thumbBox = await thumb.boundingBox()
    expect(thumbBox).not.toBeNull()
    expect(thumbBox!.width).toBeGreaterThan(0)
    expect(thumbBox!.height).toBeGreaterThan(0)
  })

  test('Debt-Free Date never shows an implausible far-future year', async ({ page }) => {
    // Visa $5K @ 24% / $50 min: monthly interest $100 > $50 min → unpayable.
    // Before the fix the pill rendered "May 2076" (600 months out). After
    // the fix it renders "Not on minimums" or shows the date for the other
    // payable debt only.
    await seedDebts(page, [
      { name: 'Visa', balance: 5000, apr: 24, minPayment: 50 },
      { name: 'Auto Loan', balance: 15000, apr: 7.99, minPayment: 300 },
    ])
    await page.goto('/#/debts')

    const pill = page.getByTestId('debt-free-date')
    await expect(pill).toBeVisible()
    const text = (await pill.textContent()) ?? ''
    const yearMatch = text.match(/(\d{4})/)
    if (yearMatch) {
      const year = parseInt(yearMatch[1], 10)
      const currentYear = new Date().getFullYear()
      expect(year).toBeLessThan(currentYear + 30)
    }
    // If no year is shown (the unpayable label or em-dash), the fix is in
    // effect and the test passes.
  })

  test('Interest Saved never shows an absurd value when an unpayable debt exists', async ({ page }) => {
    // Same scenario: Visa $5K/24%/$50 — previously produced "Interest Saved
    // $361,471,753" once the slider went above zero. After the fix the
    // unpayable debt is excluded from the baseline.
    await seedDebts(page, [
      { name: 'Visa', balance: 5000, apr: 24, minPayment: 50 },
      { name: 'Auto Loan', balance: 15000, apr: 7.99, minPayment: 300 },
    ])
    await page.goto('/#/debts')

    const value = page.getByTestId('interest-saved-value')
    await expect(value).toBeVisible()
    const text = (await value.textContent()) ?? ''
    const match = text.match(/\$[\d,]+/)
    if (match) {
      const dollars = parseInt(match[0].replace(/[$,]/g, ''), 10)
      // For a $20K debt portfolio at ordinary rates, the Interest Saved
      // metric should never exceed six figures. The pre-fix bug produced
      // hundreds of millions.
      expect(dollars).toBeLessThan(1_000_000)
    }
  })
})
