import { type Page } from '@playwright/test'

// Items that live in the "More" sheet on mobile (< 768px wide viewport).
// On desktop these are in the sidebar and always accessible directly.
const MORE_SHEET_VIEWS = ['import', 'debts', 'settings', 'export-import']

/**
 * Click a nav item by its data-testid (e.g. "nav-settings").
 * On mobile viewports, automatically opens the More sheet first
 * if the item lives inside it.
 */
export async function clickNavItem(page: Page, testId: string): Promise<void> {
  const viewport = page.viewportSize()
  const isMobile = viewport !== null && viewport.width < 768

  if (isMobile) {
    const viewName = testId.replace(/^nav-/, '')
    if (MORE_SHEET_VIEWS.includes(viewName)) {
      await page.getByTestId('nav-more').click()
      // Wait until the sheet and the target item are interactive
      await page.getByTestId('nav-more-sheet').waitFor({ state: 'visible' })
    }
  }

  await page.getByTestId(testId).click()
}
