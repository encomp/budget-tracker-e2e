import { test, expect } from '@playwright/test'
import { BackupToastPage } from '../pages/BackupToastPage'

test.describe('Backup reminder — edge cases', () => {
  test('toast does not appear when export is recent (3 days ago)', async ({ page }) => {
    await page.goto('/')
    await page.evaluate(async () => {
      // @ts-ignore
      const { Settings } = await import('/src/lib/settings.ts')
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
      await Settings.set('onboardingCompleted', true)
      await Settings.set('appOpenCount', 10)
      await Settings.set('fsaSetupShown', true)
      await Settings.set('lastExport', threeDaysAgo)
    })
    await page.reload()
    await page.waitForTimeout(2000)
    const toast = new BackupToastPage(page)
    expect(await toast.isToastVisible()).toBe(false)
  })

  test('toast does not repeat if shown today (cooldown)', async ({ page }) => {
    await page.goto('/')
    await page.evaluate(async () => {
      // @ts-ignore
      const { Settings } = await import('/src/lib/settings.ts')
      const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
      await Settings.set('onboardingCompleted', true)
      await Settings.set('appOpenCount', 10)
      await Settings.set('fsaSetupShown', true)
      await Settings.set('lastExport', tenDaysAgo)
      await Settings.set('lastReminderShown', new Date().toISOString())
    })
    await page.reload()
    await page.waitForTimeout(2000)
    const toast = new BackupToastPage(page)
    expect(await toast.isToastVisible()).toBe(false)
  })

  test('toast does not show when appOpenCount <= 3 and no export', async ({ page }) => {
    await page.goto('/')
    await page.evaluate(async () => {
      // @ts-ignore
      const { Settings } = await import('/src/lib/settings.ts')
      await Settings.set('onboardingCompleted', true)
      await Settings.set('appOpenCount', 2) // app will increment to 3 — modal territory
      await Settings.set('fsaSetupShown', false)
    })
    await page.reload()
    await page.waitForTimeout(2000)
    const toast = new BackupToastPage(page)
    expect(await toast.isToastVisible()).toBe(false)
  })
})
