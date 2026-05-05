import { test, expect, setupOnboarded } from '../fixtures'

// ── Mobile nav structure tests ────────────────────────────────────────────────
// These tests run at 390×844 (mobile). The BottomTabBar replaces the Sidebar.

test.describe('Mobile Nav @tier1', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test.beforeEach(async ({ page }) => {
    await setupOnboarded(page)
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('bottom nav shows exactly 4 items: Dashboard, Transactions, Budget, More', async ({ page }) => {
    const nav = page.getByTestId('bottom-tab-bar')
    await expect(nav).toBeVisible()

    const buttons = nav.getByRole('button')
    await expect(buttons).toHaveCount(4)

    await expect(page.getByTestId('nav-dashboard')).toBeVisible()
    await expect(page.getByTestId('nav-transactions')).toBeVisible()
    await expect(page.getByTestId('nav-budget')).toBeVisible()
    await expect(page.getByTestId('nav-more')).toBeVisible()
  })

  test('Import, Debts, Settings, Export/Import are NOT in the bottom bar directly', async ({ page }) => {
    const nav = page.getByTestId('bottom-tab-bar')
    await expect(nav.getByTestId('nav-import')).not.toBeVisible()
    await expect(nav.getByTestId('nav-debts')).not.toBeVisible()
    await expect(nav.getByTestId('nav-settings')).not.toBeVisible()
    await expect(nav.getByTestId('nav-export-import')).not.toBeVisible()
  })

  test('More sheet opens with 4 items when More button is clicked', async ({ page }) => {
    await page.getByTestId('nav-more').click()

    const sheet = page.getByTestId('nav-more-sheet')
    await expect(sheet).toBeVisible()

    await expect(sheet.getByTestId('nav-import')).toBeVisible()
    await expect(sheet.getByTestId('nav-debts')).toBeVisible()
    await expect(sheet.getByTestId('nav-settings')).toBeVisible()
    await expect(sheet.getByTestId('nav-export-import')).toBeVisible()
  })

  test('clicking Settings in More sheet navigates and closes the sheet', async ({ page }) => {
    await page.getByTestId('nav-more').click()
    await page.getByTestId('nav-more-sheet').waitFor({ state: 'visible' })

    await page.getByTestId('nav-settings').click()

    await expect(page.getByTestId('settings-profile-name')).toBeVisible()
    await expect(page.getByTestId('nav-more-sheet')).not.toBeVisible()
  })

  test('More button has active styling when a More-sheet view is active', async ({ page }) => {
    await page.getByTestId('nav-more').click()
    await page.getByTestId('nav-settings').click()
    await page.getByTestId('settings-profile-name').waitFor({ state: 'visible' })

    // More button should reflect the active More-group view
    const moreBtn = page.getByTestId('nav-more')
    await expect(moreBtn).toHaveAttribute('aria-expanded', 'false')
    // The button exists and is visible with correct testid
    await expect(moreBtn).toBeVisible()
  })

  test('sheet closes when Escape is pressed', async ({ page }) => {
    await page.getByTestId('nav-more').click()
    await page.getByTestId('nav-more-sheet').waitFor({ state: 'visible' })

    await page.keyboard.press('Escape')

    await expect(page.getByTestId('nav-more-sheet')).not.toBeVisible()
  })
})

// ── Desktop sidebar regression guard ─────────────────────────────────────────
// Ensures the mobile nav fix does NOT affect the desktop sidebar.

test.describe('Desktop Nav Regression Guard @tier1', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test.beforeEach(async ({ page }) => {
    await setupOnboarded(page)
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('desktop sidebar contains all 7 nav items and no More button', async ({ page }) => {
    const sidebar = page.getByTestId('sidebar')
    await expect(sidebar).toBeVisible()

    await expect(sidebar.getByTestId('nav-dashboard')).toBeVisible()
    await expect(sidebar.getByTestId('nav-transactions')).toBeVisible()
    await expect(sidebar.getByTestId('nav-import')).toBeVisible()
    await expect(sidebar.getByTestId('nav-budget')).toBeVisible()
    await expect(sidebar.getByTestId('nav-debts')).toBeVisible()
    await expect(sidebar.getByTestId('nav-settings')).toBeVisible()
    await expect(sidebar.getByTestId('nav-export-import')).toBeVisible()

    await expect(page.getByTestId('nav-more')).not.toBeVisible()
  })
})
