import { test, expect, setupOnboarded } from '../fixtures'
import { seedSetting } from '../helpers/db'
import { format, subDays } from 'date-fns'

test.describe('Backup Reminder @tier2', () => {
  test.beforeEach(async ({ page }) => {
    await setupOnboarded(page)
    // Ensure modal territory is bypassed and reminder can fire
    await seedSetting(page, 'fsaSetupShown', true)
    await seedSetting(page, 'appOpenCount', 10)
  })

  test('bell toast fires when last export was over 7 days ago', async ({
    page,
  }) => {
    const tenDaysAgo = format(subDays(new Date(), 10), 'yyyy-MM-dd')
    await seedSetting(page, 'lastExport', tenDaysAgo)

    await page.reload({ waitUntil: 'networkidle' })

    await expect(page.getByTestId('global-toast-container')).toBeVisible()
    await expect(page.getByTestId('global-toast-container').getByTestId('toast-message')).toContainText('backup')
  })

  test('no reminder when last export was recent', async ({ page }) => {
    const today = format(new Date(), 'yyyy-MM-dd')
    await seedSetting(page, 'lastExport', today)
    await page.reload({ waitUntil: 'networkidle' })

    await page.waitForTimeout(1500)
    await expect(page.getByTestId('global-toast-container')).not.toBeVisible()
  })

  test('no reminder when user has never exported but appOpenCount <= 3', async ({ page }) => {
    await seedSetting(page, 'appOpenCount', 2)
    await seedSetting(page, 'fsaSetupShown', false)
    await page.reload({ waitUntil: 'networkidle' })
    await page.waitForTimeout(1500)
    await expect(page.getByTestId('global-toast-container')).not.toBeVisible()
  })
})
