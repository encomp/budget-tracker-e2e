import { test, expect, setupOnboarded } from '../fixtures'

test.use({ viewport: { width: 390, height: 844 } })

test.describe('Mobile Responsive @tier2', () => {
  test.beforeEach(async ({ page }) => {
    await setupOnboarded(page)
  })

  test('bottom tab bar is visible on mobile', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await expect(page.getByTestId('bottom-tab-bar')).toBeVisible()
  })

  test('sidebar is NOT visible on mobile', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await expect(page.getByTestId('sidebar')).not.toBeVisible()
  })

  test('FAB is positioned above the bottom tab bar', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const fab    = page.getByTestId('fab-add-transaction')
    const tabBar = page.getByTestId('bottom-tab-bar')

    const fabBox    = await fab.boundingBox()
    const tabBarBox = await tabBar.boundingBox()

    expect(fabBox).not.toBeNull()
    expect(tabBarBox).not.toBeNull()

    expect(fabBox!.y + fabBox!.height).toBeLessThan(tabBarBox!.y)
  })

  test('all 4 bottom tabs navigate correctly', async ({ page }) => {
    await page.goto('/')

    const tabs: Array<{ testId: string; landingTestId: string }> = [
      { testId: 'nav-transactions', landingTestId: 'transactions-table' },
      { testId: 'nav-budget',       landingTestId: 'budget-income-input' },
      { testId: 'nav-settings',     landingTestId: 'settings-profile-name' },
      { testId: 'nav-dashboard',    landingTestId: 'metric-income' },
    ]

    for (const tab of tabs) {
      await page.getByTestId(tab.testId).click()
      await expect(page.getByTestId(tab.landingTestId)).toBeVisible()
    }
  })

  test('transaction entry opens as bottom sheet on mobile', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('fab-add-transaction').click()

    const modal = page.getByTestId('transaction-modal')
    await modal.waitFor({ state: 'visible' })
    const box = await modal.boundingBox()

    expect(box!.width).toBeGreaterThan(350)
    expect(box!.y + box!.height).toBeGreaterThan(700)
  })
})

// ── HeatmapCalendar keyboard navigation @tier2 ────────────────────────────
// These tests run at desktop viewport so the heatmap is visible on the Dashboard.
test.describe('HeatmapCalendar keyboard navigation @tier2', () => {
  test.use({ viewport: { width: 1280, height: 800 } })

  test.beforeEach(async ({ page }) => {
    await setupOnboarded(page)
    // Navigate to Dashboard where the heatmap lives
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  /**
   * TC-KB01: Tab into the heatmap grid and verify ArrowRight moves focus to
   * the next day (the aria-label on the focused cell changes to the next date).
   */
  test('TC-KB01 HeatmapCalendar ArrowRight moves focus to next day', async ({ page }) => {
    const grid = page.getByTestId('heatmap-calendar')
    await grid.waitFor({ state: 'visible' })

    // Tab into the grid — the roving-tabIndex cell (tabIndex=0) receives focus
    await grid.press('Tab')

    // Capture current focused cell aria-label
    const initialLabel = await page.evaluate(() => {
      const el = document.activeElement
      return el ? el.getAttribute('aria-label') : null
    })
    expect(initialLabel).toBeTruthy()

    // Press ArrowRight — focus should advance to the next day
    await page.keyboard.press('ArrowRight')

    const nextLabel = await page.evaluate(() => {
      const el = document.activeElement
      return el ? el.getAttribute('aria-label') : null
    })
    expect(nextLabel).toBeTruthy()
    // The two labels must be different — focus has moved
    expect(nextLabel).not.toBe(initialLabel)
  })

  /**
   * TC-KB02: Press Home from any cell and verify the focused cell's aria-label
   * contains the 1st of the displayed month.
   */
  test('TC-KB02 HeatmapCalendar Home key moves focus to first day of month', async ({ page }) => {
    const grid = page.getByTestId('heatmap-calendar')
    await grid.waitFor({ state: 'visible' })

    // Tab into grid, move to some other day, then press Home
    await grid.press('Tab')
    await page.keyboard.press('ArrowRight')
    await page.keyboard.press('ArrowRight')
    await page.keyboard.press('Home')

    const label = await page.evaluate(() => {
      const el = document.activeElement
      return el ? el.getAttribute('aria-label') : null
    })
    expect(label).toBeTruthy()
    // aria-label for the first day contains "-01" (e.g. "2025-01-01: No spending")
    expect(label).toMatch(/-01(?!\d)/)
  })
})
