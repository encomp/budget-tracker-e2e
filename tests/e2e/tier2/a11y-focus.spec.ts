import { test, expect, setupOnboarded } from '../fixtures'

// Low-contrast theme fixture for TC-A07
const LOW_CONTRAST_THEME = {
  id: 'test-low-contrast',
  name: 'Low Contrast Test',
  description: 'For testing',
  version: '1.0.0',
  tokens: {
    '--bp-bg-base': '#f0f0f0',
    '--bp-bg-surface': '#eeeeee',
    '--bp-text-primary': '#cccccc',   // low contrast on #f0f0f0
    '--bp-text-secondary': '#dddddd',
    '--bp-accent': '#e0e0e0',
    '--bp-border': '#ddd',
    '--bp-positive': '#00cc00',
    '--bp-danger': '#cc0000',
  },
}

test.describe('Accessibility Focus & ARIA @tier2', () => {
  test.beforeEach(async ({ page }) => {
    await setupOnboarded(page)
  })

  // TC-A01: Focus trap in modal
  test('TC-A01 Tab key focus stays trapped inside Add Transaction dialog', async ({
    page,
    dashboardPage,
  }) => {
    await dashboardPage.goto()
    await dashboardPage.clickAddTransaction()

    // Wait for the modal to open
    await page.getByTestId('transaction-modal').waitFor({ state: 'visible' })

    // Tab through elements several times and verify focus doesn't escape the dialog
    const dialog = page.getByTestId('transaction-modal')
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab')
    }

    // The focused element should still be inside the dialog
    const focusedInsideDialog = await page.evaluate(() => {
      const dialog = document.querySelector('[data-testid="transaction-modal"]')
      const focused = document.activeElement
      return dialog !== null && focused !== null && dialog.contains(focused)
    })

    expect(focusedInsideDialog).toBe(true)
    await expect(dialog).toBeVisible()
  })

  // TC-A02: Escape closes modal
  test('TC-A02 pressing Escape closes the Add Transaction dialog', async ({
    page,
    dashboardPage,
  }) => {
    await dashboardPage.goto()
    await dashboardPage.clickAddTransaction()

    const modal = page.getByTestId('transaction-modal')
    await modal.waitFor({ state: 'visible' })

    // Press Escape to close the dialog
    await page.keyboard.press('Escape')

    // Modal should be hidden or removed from DOM
    await modal.waitFor({ state: 'hidden' })
    await expect(modal).not.toBeVisible()
  })

  // TC-A03: BpProgressBar ARIA attributes
  test('TC-A03 budget progress bars have complete ARIA attributes', async ({
    page,
  }) => {
    await page.getByTestId('nav-budget').click()
    await page.waitForLoadState('networkidle')

    // Find at least one progressbar
    const progressBars = page.getByRole('progressbar')
    await expect(progressBars.first()).toBeVisible()

    const firstBar = progressBars.first()

    // Verify ARIA attributes
    await expect(firstBar).toHaveAttribute('aria-valuemin', '0')
    await expect(firstBar).toHaveAttribute('aria-valuemax', '100')

    const valueNow = await firstBar.getAttribute('aria-valuenow')
    expect(valueNow).not.toBeNull()
    expect(Number(valueNow)).not.toBeNaN()

    const ariaLabel = await firstBar.getAttribute('aria-label')
    expect(ariaLabel).not.toBeNull()
    expect(ariaLabel!.length).toBeGreaterThan(0)
  })

  // TC-A04: HeatmapCalendar grid ARIA structure
  test('TC-A04 HeatmapCalendar has complete grid ARIA structure', async ({
    page,
    dashboardPage,
  }) => {
    await dashboardPage.goto()
    await dashboardPage.heatmapGrid.waitFor({ state: 'visible' })

    const heatmap = page.getByTestId('heatmap-calendar')

    // Verify grid role exists
    const grid = heatmap.getByRole('grid')
    await expect(grid).toBeVisible()

    // Verify row children exist
    const rows = heatmap.getByRole('row')
    expect(await rows.count()).toBeGreaterThan(0)

    // Verify gridcell elements exist with aria-label
    const gridCells = heatmap.getByRole('gridcell')
    expect(await gridCells.count()).toBeGreaterThan(0)

    const firstCellLabel = await gridCells.first().getAttribute('aria-label')
    expect(firstCellLabel).not.toBeNull()

    // Verify columnheader elements exist
    const columnHeaders = heatmap.getByRole('columnheader')
    expect(await columnHeaders.count()).toBeGreaterThan(0)
  })

  // TC-A05: Reduced motion smoke test
  test('TC-A05 app functions normally under prefers-reduced-motion: reduce', async ({
    page,
    dashboardPage,
  }) => {
    // Emulate reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' })

    // Navigate to dashboard — should still function, no crash
    await dashboardPage.goto()
    await expect(dashboardPage.incomeCard).toBeVisible()
    await expect(dashboardPage.expensesCard).toBeVisible()
    await expect(dashboardPage.heatmapGrid).toBeVisible()

    // Navigate to another page and back — should still work
    await page.getByTestId('nav-transactions').click()
    await page.waitForLoadState('networkidle')
    await page.getByTestId('nav-dashboard').click()
    await dashboardPage.incomeCard.waitFor({ state: 'visible' })

    // App should still be functional
    await expect(dashboardPage.incomeCard).toBeVisible()
  })

  // TC-A06: Icon-only buttons have aria-label
  test('TC-A06 icon-only buttons on Transactions page have non-empty aria-label', async ({
    page,
  }) => {
    await page.getByTestId('nav-transactions').click()
    await page.waitForLoadState('networkidle')

    // Find all buttons in the transactions view
    const allButtons = page.locator('button')
    const buttonCount = await allButtons.count()

    // Check each button: if it has no visible text content, it must have aria-label
    const violatingButtons: string[] = []

    for (let i = 0; i < buttonCount; i++) {
      const button = allButtons.nth(i)
      const isVisible = await button.isVisible()
      if (!isVisible) continue

      const textContent = await button.textContent()
      const trimmedText = textContent?.trim() ?? ''

      // If button has no visible text, it should have aria-label
      if (trimmedText === '') {
        const ariaLabel = await button.getAttribute('aria-label')
        const ariaLabelledBy = await button.getAttribute('aria-labelledby')
        const hasLabel = (ariaLabel && ariaLabel.trim().length > 0) ||
                         (ariaLabelledBy && ariaLabelledBy.trim().length > 0)

        if (!hasLabel) {
          const testId = await button.getAttribute('data-testid')
          violatingButtons.push(testId ?? `button-at-index-${i}`)
        }
      }
    }

    expect(violatingButtons).toEqual([])
  })

  // TC-A07: Contrast warning visible for low-contrast theme
  test('TC-A07 uploading a low-contrast theme shows the contrast warning', async ({
    page,
    themeGallery,
  }) => {
    await themeGallery.goto()

    // Upload the low-contrast theme via the hidden file input
    const themeJson = JSON.stringify(LOW_CONTRAST_THEME)
    await page.getByTestId('theme-dropzone').setInputFiles({
      name: 'low-contrast.json',
      mimeType: 'application/json',
      buffer: Buffer.from(themeJson),
    })

    // Wait for the preview panel to appear
    await page.getByTestId('theme-preview-panel').waitFor({ state: 'visible' })

    // Verify the contrast warning is visible
    const contrastWarning = page.getByTestId('theme-contrast-warning')
    await expect(contrastWarning).toBeVisible()
  })
})
