import { test, expect } from '@playwright/test'
import { AutoBackupModalPage } from '../pages/AutoBackupModalPage'
import { seedOpenCount3 } from '../helpers/db'

test.describe('AutoBackup modal — day 3 trigger', () => {
  test('modal appears on 3rd app open', async ({ page }) => {
    await page.goto('/')
    await seedOpenCount3(page)
    await page.reload()
    const modal = new AutoBackupModalPage(page)
    await modal.waitForModal()
    expect(await modal.isVisible()).toBe(true)
  })

  test('modal does not appear again after secondary button clicked', async ({ page }) => {
    await page.goto('/')
    await seedOpenCount3(page)
    await page.reload()
    const modal = new AutoBackupModalPage(page)
    await modal.waitForModal()
    await modal.clickSecondary()
    await page.reload()
    await page.waitForTimeout(1500)
    expect(await modal.isVisible()).toBe(false)
  })

  test('modal shows correct CTA for current browser', async ({ page, browserName, isMobile }) => {
    await page.goto('/')
    await seedOpenCount3(page)
    await page.reload()
    const modal = new AutoBackupModalPage(page)
    await modal.waitForModal()
    const btnText = await modal.getPrimaryButtonText()
    if (browserName === 'chromium' && !isMobile) {
      expect(btnText).toContain('Folder')
    } else {
      expect(btnText).toContain('Export')
    }
  })

  test('modal body text is not empty', async ({ page }) => {
    await page.goto('/')
    await seedOpenCount3(page)
    await page.reload()
    const modal = new AutoBackupModalPage(page)
    await modal.waitForModal()
    const body = await modal.modalBody.innerText()
    expect(body.length).toBeGreaterThan(20)
  })
})
