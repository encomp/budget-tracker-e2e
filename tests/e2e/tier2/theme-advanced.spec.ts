import { test, expect, setupOnboarded } from '../fixtures'
import {
  ROSE_THEME,
  FOREST_THEME_WITH_ICONS,
  INVALID_THEME,
} from '../fixtures/themes'

test.describe('Theme Advanced @tier2', () => {
  test.beforeEach(async ({ page }) => {
    await setupOnboarded(page)
  })

  // TC-06: Preview panel shows correct font label
  test('preview panel shows font label from --bp-font-ui token', async ({
    themeGallery,
  }) => {
    await themeGallery.goto()
    await themeGallery.uploadAndPreview(ROSE_THEME, 'rose.json')

    // DM Sans is the font in ROSE_THEME
    await expect(themeGallery.previewFontLabel).toContainText('DM Sans')
  })

  // TC-07: ThemeIcon preview uses themeOverride
  test('preview panel icon slots use uploaded theme, not active theme', async ({
    page,
    themeGallery,
  }) => {
    await themeGallery.goto()
    await themeGallery.uploadAndPreview(FOREST_THEME_WITH_ICONS, 'forest.json')

    await expect(
      page.getByTestId('theme-preview-icon-1')
    ).toBeVisible()
  })

  // TC-08: Cancel closes panel without applying
  test('Cancel closes preview panel without changing theme', async ({
    themeGallery,
  }) => {
    await themeGallery.goto()
    const accentBefore = await themeGallery.getCurrentAccent()

    await themeGallery.uploadAndPreview(ROSE_THEME, 'rose.json')
    await themeGallery.cancelButton.click()

    await expect(themeGallery.previewPanel).not.toBeVisible()
    expect(await themeGallery.getCurrentAccent()).toBe(accentBefore)
  })

  // TC-16: Invalid theme shows error toast
  test('invalid theme JSON shows error toast and no preview panel', async ({
    page,
    themeGallery,
  }) => {
    await themeGallery.goto()
    await themeGallery.uploadTheme(INVALID_THEME, 'invalid.json')

    await expect(page.getByTestId('toast-container')).toBeVisible()
    await expect(page.getByTestId('toast-message')).toContainText('Invalid')
    await expect(themeGallery.previewPanel).not.toBeVisible()
  })

  // Duplicate ID replacement
  test('uploading theme with same ID replaces existing, no duplicate', async ({
    themeGallery,
  }) => {
    await themeGallery.goto()

    await themeGallery.uploadAndSaveToLibrary(ROSE_THEME, 'rose.json')
    expect(await themeGallery.getInstalledThemeCount()).toBe(1)

    await themeGallery.uploadAndSaveToLibrary(ROSE_THEME, 'rose-v2.json')

    // Still only 1 card — no duplicate
    expect(await themeGallery.getInstalledThemeCount()).toBe(1)
  })

  // TC-05 variant: Focus theme reduces motion intensity
  test('Focus theme sets --bp-motion-intensity to near-zero', async ({
    page,
    themeGallery,
  }) => {
    await themeGallery.goto()
    await themeGallery.applyThemeFromGallery('focus')

    const motionIntensity = await page.evaluate(() =>
      getComputedStyle(document.documentElement)
        .getPropertyValue('--bp-motion-intensity')
        .trim()
    )
    expect(parseFloat(motionIntensity)).toBeLessThanOrEqual(0.1)
  })

  // TC-05 variant: Bundled theme cards have no Remove button
  test('bundled theme cards do not have a Remove button', async ({
    page,
    themeGallery,
  }) => {
    await themeGallery.goto()
    await expect(
      page.getByTestId('theme-card-remove-midnight')
    ).not.toBeVisible()
    await expect(
      page.getByTestId('theme-card-remove-focus')
    ).not.toBeVisible()
  })

  // TC-13: Category icons on transaction rows
  test('transaction rows show ThemeIcon beside category name', async ({
    page,
  }) => {
    await page.getByTestId('fab-add-transaction').click()
    await page.getByTestId('transaction-modal').waitFor({ state: 'visible' })
    await page.getByTestId('txn-amount').fill('25')
    await page.getByTestId('txn-type-expense').click()
    await page.getByTestId('txn-category').click()
    await page.getByRole('option', { name: 'Groceries' }).click()
    await page.getByTestId('txn-save').click()
    await page.getByTestId('transaction-modal').waitFor({ state: 'hidden' })

    await page.getByTestId('nav-transactions').click()
    await page.waitForLoadState('networkidle')

    const row = page.getByTestId('transaction-row').first()
    await expect(row.locator('[data-testid^="theme-icon-"]')).toBeVisible()
  })

  // TC-14: Uncategorized rows have no icon
  test('uncategorized transaction rows show no ThemeIcon', async ({
    page,
  }) => {
    await page.evaluate(async () => {
      // @ts-ignore — browser-context dynamic import resolved at runtime by Vite
      const { db } = await import('/src/lib/db.ts')
      await db.transactions.add({
        id: crypto.randomUUID(),
        date: new Date().toISOString().slice(0, 10),
        amount: 10,
        type: 'expense',
        categoryId: null,
        note: '',
        importSource: 'csv',
      })
    })

    await page.getByTestId('nav-transactions').click()
    await page.waitForLoadState('networkidle')

    const uncatBadge = page.getByTestId('badge-uncategorized').first()
    const uncatRow = uncatBadge.locator('../..')
    await expect(
      uncatRow.locator('[data-testid^="theme-icon-"]')
    ).not.toBeVisible()
  })
})
