import { test, expect } from '@playwright/test'
import { StartHerePage } from '../pages/StartHerePage'

test.describe('START_HERE.html', () => {
  test('loads without error', async ({ page }) => {
    const startHere = new StartHerePage(page)
    await startHere.goto()
    await expect(page).not.toHaveURL(/error/)
    expect(await startHere.getVisibleSectionId()).toBeTruthy()
  })

  test('shows exactly one platform section', async ({ page }) => {
    const startHere = new StartHerePage(page)
    await startHere.goto()
    const visibleCount = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLElement>('.platform-section')]
        .filter(el => el.style.display !== 'none').length
    )
    expect(visibleCount).toBe(1)
  })

  test('Open App button navigates to index.html', async ({ page }) => {
    const startHere = new StartHerePage(page)
    await startHere.goto()
    await startHere.openAppButton.click()
    await page.waitForURL(/index\.html|localhost/)
  })

  test('headline is not empty on detected platform', async ({ page }) => {
    const startHere = new StartHerePage(page)
    await startHere.goto()
    const headline = await startHere.getHeadlineText()
    expect(headline.length).toBeGreaterThan(0)
  })
})
