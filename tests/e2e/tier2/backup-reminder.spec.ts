import { test, expect, setupOnboarded } from '../fixtures'
import { seedSetting } from '../helpers/db'
import { format, subDays } from 'date-fns'

test.describe('Backup Reminder @tier2', () => {
  test.beforeEach(async ({ page }) => {
    await setupOnboarded(page)
  })

  test('bell toast fires when last export was over 7 days ago', async ({
    page,
  }) => {
    const eightDaysAgo = format(subDays(new Date(), 8), 'yyyy-MM-dd')
    await seedSetting(page, 'lastExport', eightDaysAgo)

    await page.reload({ waitUntil: 'networkidle' })

    await expect(page.getByTestId('toast-container')).toBeVisible()
    await expect(page.getByTestId('toast-message')).toContainText('backup')
  })

  test('no reminder when last export was recent', async ({ page }) => {
    const today = format(new Date(), 'yyyy-MM-dd')
    await seedSetting(page, 'lastExport', today)
    await page.reload({ waitUntil: 'networkidle' })

    await page.waitForTimeout(1500)
    await expect(page.getByTestId('toast-container')).not.toBeVisible()
  })

  test('no reminder when user has never exported', async ({ page }) => {
    await page.reload({ waitUntil: 'networkidle' })
    await page.waitForTimeout(1500)
    await expect(page.getByTestId('toast-container')).not.toBeVisible()
  })
})
