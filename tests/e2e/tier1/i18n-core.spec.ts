import { test, expect, setupOnboarded } from '../fixtures'

test.describe('i18n Core @tier1', () => {
  test.beforeEach(async ({ page }) => {
    await setupOnboarded(page)
  })

  // TC-L01: Language switch to Spanish
  test('TC-L01 switching to Spanish renders nav and dashboard in Spanish', async ({
    page,
    dashboardPage,
  }) => {
    // Navigate to Settings and change language
    await page.getByTestId('nav-settings').click()
    await page.getByTestId('settings-language-select').click()
    await page.getByRole('option', { name: /español/i }).click()

    // Wait for UI to reflect the change
    await page.waitForFunction(() => {
      const el = document.querySelector('[data-testid="nav-transactions"]')
      return el?.textContent?.includes('Transacciones')
    })

    // Verify nav.transactions is in Spanish
    await expect(page.getByTestId('nav-transactions')).toContainText('Transacciones')

    // Navigate to Dashboard and verify title is in Spanish
    await page.getByTestId('nav-dashboard').click()
    await dashboardPage.incomeCard.waitFor({ state: 'visible' })
    await expect(dashboardPage.incomeCard).toContainText('Ingresos')
  })

  // TC-L02: Language switch to French
  test('TC-L02 switching to French renders nav and dashboard income in French', async ({
    page,
    dashboardPage,
  }) => {
    // Navigate to Settings and change language to French
    await page.getByTestId('nav-settings').click()
    await page.getByTestId('settings-language-select').click()
    await page.getByRole('option', { name: /français/i }).click()

    // Wait for nav to update
    await page.waitForFunction(() => {
      const el = document.querySelector('[data-testid="nav-settings"]')
      return el?.textContent?.includes('Param')
    })

    // nav.transactions is "Transactions" in FR (same as EN) — verify it's rendered
    await expect(page.getByTestId('nav-transactions')).toContainText('Transactions')

    // Navigate to Dashboard and verify dashboard.income = "Revenus"
    await page.getByTestId('nav-dashboard').click()
    await dashboardPage.incomeCard.waitFor({ state: 'visible' })
    await expect(dashboardPage.incomeCard).toContainText('Revenus')
  })

  // TC-L03: Language persists on reload
  test('TC-L03 Spanish language selection persists after page reload', async ({
    page,
  }) => {
    // Switch to Spanish
    await page.getByTestId('nav-settings').click()
    await page.getByTestId('settings-language-select').click()
    await page.getByRole('option', { name: /español/i }).click()

    // Wait for language to be applied and persisted
    await page.waitForFunction(() => {
      const el = document.querySelector('[data-testid="nav-transactions"]')
      return el?.textContent?.includes('Transacciones')
    })

    // Reload the page
    await page.reload({ waitUntil: 'networkidle' })

    // Verify the language is still Spanish after reload
    await page.waitForSelector('[data-testid="nav-transactions"]', { state: 'visible' })
    await expect(page.getByTestId('nav-transactions')).toContainText('Transacciones')
  })

  // TC-L04: Currency formatting for French locale
  test('TC-L04 French locale shows euro symbol in currency display', async ({
    page,
    dashboardPage,
  }) => {
    // Switch to French locale which has € as the currency symbol in the locale file
    await page.getByTestId('nav-settings').click()

    // Set currency to € via the profile form
    await page.getByTestId('settings-profile-currency').fill('€')
    await page.getByTestId('settings-profile-save').click()

    // Switch language to French
    await page.getByTestId('settings-language-select').click()
    await page.getByRole('option', { name: /français/i }).click()

    await page.waitForFunction(() => {
      const el = document.querySelector('[data-testid="nav-settings"]')
      return el?.textContent?.includes('Param')
    })

    // Navigate to Dashboard
    await page.getByTestId('nav-dashboard').click()
    await dashboardPage.incomeCard.waitFor({ state: 'visible' })

    // Verify the € symbol appears somewhere in the dashboard metric values
    const incomeValue = await dashboardPage.getMetricValue('income')
    const expensesValue = await dashboardPage.getMetricValue('expenses')
    const remainingValue = await dashboardPage.getMetricValue('remaining')

    const allText = [incomeValue, expensesValue, remainingValue].join(' ')
    expect(allText).toContain('€')
  })

  // TC-L05: Heatmap weekday headers in Spanish
  test('TC-L05 Spanish locale shows Spanish weekday abbreviations in heatmap column headers', async ({
    page,
    dashboardPage,
  }) => {
    // Switch to Spanish
    await page.getByTestId('nav-settings').click()
    await page.getByTestId('settings-language-select').click()
    await page.getByRole('option', { name: /español/i }).click()

    await page.waitForFunction(() => {
      const el = document.querySelector('[data-testid="nav-transactions"]')
      return el?.textContent?.includes('Transacciones')
    })

    // Navigate to Dashboard to see the heatmap
    await page.getByTestId('nav-dashboard').click()
    await dashboardPage.heatmapGrid.waitFor({ state: 'visible' })

    // Get all column header text from the heatmap grid
    const columnHeaders = await page
      .getByTestId('heatmap-calendar')
      .getByRole('columnheader')
      .allTextContents()

    // Spanish short weekday abbreviations (Intl.DateTimeFormat 'narrow' with es locale)
    // Could be: D, L, M, X, J, V, S  or  do, lu, ma, mi, ju, vi, sá
    // They should NOT be English (Su, Mo, Tu, We, Th, Fr, Sa)
    expect(columnHeaders.length).toBeGreaterThan(0)

    // Verify none of the headers match English abbreviations exclusively
    const englishAbbreviations = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const allEnglish = columnHeaders.every((h) =>
      englishAbbreviations.some((en) => en.toLowerCase() === h.toLowerCase().trim())
    )
    expect(allEnglish).toBe(false)
  })
})
