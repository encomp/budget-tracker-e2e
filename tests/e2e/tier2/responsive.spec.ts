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
