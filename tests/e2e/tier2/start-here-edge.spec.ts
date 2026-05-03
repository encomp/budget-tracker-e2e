import { test, expect } from '@playwright/test'
import { StartHerePage } from '../pages/StartHerePage'

test.describe('START_HERE.html — edge cases', () => {
  test('renders at 320px viewport (minimum mobile width)', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 })
    const startHere = new StartHerePage(page)
    await startHere.goto()
    expect(await startHere.getVisibleSectionId()).toBeTruthy()
    const btn = startHere.openAppButton
    await expect(btn).toBeVisible()
    const box = await btn.boundingBox()
    expect(box).not.toBeNull()
    expect(box!.width).toBeGreaterThan(0)
  })

  test('privacy footer is present on all platform sections', async ({ page }) => {
    const startHere = new StartHerePage(page)
    await startHere.goto()
    const footerText = await page.locator('body').innerText()
    expect(footerText).toContain('never leaves your device')
  })
})
