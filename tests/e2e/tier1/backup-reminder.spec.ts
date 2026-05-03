import { test, expect } from '@playwright/test'
import { BackupToastPage } from '../pages/BackupToastPage'
import { seedNoExport, seedLapsedExport } from '../helpers/db'

test.describe('Backup reminder toast', () => {
  test('shows for never-exported user on app open', async ({ page }) => {
    await page.goto('/')
    await seedNoExport(page)
    await page.reload()
    const toast = new BackupToastPage(page)
    await toast.waitForToast()
    expect(await toast.getToastMessage()).toContain("haven't backed up")
  })

  test('shows for user with lapsed export', async ({ page }) => {
    await page.goto('/')
    await seedLapsedExport(page)
    await page.reload()
    const toast = new BackupToastPage(page)
    await toast.waitForToast()
    expect(await toast.getToastMessage()).toContain('days ago')
  })

  test('toast has Back Up Now action button', async ({ page }) => {
    await page.goto('/')
    await seedNoExport(page)
    await page.reload()
    const toast = new BackupToastPage(page)
    await toast.waitForToast()
    await expect(toast.toastActionButton).toBeVisible()
  })

  test('toast persists without auto-dismissing', async ({ page }) => {
    await page.goto('/')
    await seedNoExport(page)
    await page.reload()
    const toast = new BackupToastPage(page)
    await toast.waitForToast()
    await page.waitForTimeout(5000)
    expect(await toast.isToastVisible()).toBe(true)
  })

  test('toast dismisses when × clicked', async ({ page }) => {
    await page.goto('/')
    await seedNoExport(page)
    await page.reload()
    const toast = new BackupToastPage(page)
    await toast.waitForToast()
    await toast.dismiss()
    expect(await toast.isToastVisible()).toBe(false)
  })
})
