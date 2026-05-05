import { test, expect, setupOnboarded } from '../fixtures'
import { clickNavItem } from '../helpers/nav'

const FAB_VISIBLE_VIEWS = [
  { name: 'dashboard',    navigateTo: async (page: import('@playwright/test').Page) => {
    await page.getByTestId('nav-dashboard').click()
    await page.getByTestId('metric-income').waitFor({ state: 'visible' })
  }},
  { name: 'transactions', navigateTo: async (page: import('@playwright/test').Page) => {
    await page.getByTestId('nav-transactions').click()
    await page.getByTestId('txn-search').waitFor({ state: 'visible' })
  }},
]

const FAB_HIDDEN_VIEWS = [
  { name: 'import',        navigateTo: async (page: import('@playwright/test').Page) => {
    await clickNavItem(page, 'nav-import')
  }},
  { name: 'budget',        navigateTo: async (page: import('@playwright/test').Page) => {
    await page.getByTestId('nav-budget').click()
    await page.getByTestId('budget-income-input').waitFor({ state: 'visible' })
  }},
  { name: 'debts',         navigateTo: async (page: import('@playwright/test').Page) => {
    await clickNavItem(page, 'nav-debts')
  }},
  { name: 'settings',      navigateTo: async (page: import('@playwright/test').Page) => {
    await clickNavItem(page, 'nav-settings')
    await page.getByTestId('settings-profile-name').waitFor({ state: 'visible' })
  }},
  { name: 'export-import', navigateTo: async (page: import('@playwright/test').Page) => {
    await clickNavItem(page, 'nav-export-import')
  }},
]

// Run on both desktop and mobile so FAB filtering is consistent across breakpoints.
for (const vpLabel of ['desktop', 'mobile'] as const) {
  const viewport = vpLabel === 'desktop'
    ? { width: 1280, height: 800 }
    : { width: 390, height: 844 }

  test.describe(`FAB Visibility — ${vpLabel} @tier1`, () => {
    test.use({ viewport })

    test.beforeEach(async ({ page }) => {
      await setupOnboarded(page)
      await page.goto('/')
      await page.waitForLoadState('networkidle')
    })

    for (const view of FAB_VISIBLE_VIEWS) {
      test(`FAB visible on ${view.name}`, async ({ page }) => {
        await view.navigateTo(page)
        await expect(page.getByTestId('add-transaction-fab')).toBeVisible()
      })
    }

    for (const view of FAB_HIDDEN_VIEWS) {
      test(`FAB hidden on ${view.name}`, async ({ page }) => {
        await view.navigateTo(page)
        await expect(page.getByTestId('add-transaction-fab')).not.toBeVisible()
      })
    }
  })
}
