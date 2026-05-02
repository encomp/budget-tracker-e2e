import { test, expect, setupOnboarded } from '../fixtures'
import { ROSE_THEME, FOREST_THEME_WITH_ICONS } from '../fixtures/themes'

test.describe('Theme Gallery @tier1', () => {
  test.beforeEach(async ({ page }) => {
    await setupOnboarded(page)
  })

  // TC-04: Bundled section always present
  test('bundled themes section always shows with Midnight active', async ({
    page,
    themeGallery,
  }) => {
    await themeGallery.goto()
    await expect(themeGallery.bundledSection).toBeVisible()
    expect(await themeGallery.isThemeActive('midnight')).toBe(true)
    // Focus card shows Apply button, not checkmark
    await expect(
      page.getByTestId('theme-card-apply-focus')
    ).toBeVisible()
  })

  // TC-05: Apply bundled theme
  test('applying Focus theme changes active state and persists', async ({
    page,
    themeGallery,
  }) => {
    await themeGallery.goto()
    await themeGallery.applyThemeFromGallery('focus')

    expect(await themeGallery.isThemeActive('focus')).toBe(true)
    expect(await themeGallery.isThemeActive('midnight')).toBe(false)

    // Persists across reload
    await page.reload({ waitUntil: 'networkidle' })
    await page.getByTestId('nav-settings').click()
    await themeGallery.gallery.waitFor()
    expect(await themeGallery.isThemeActive('focus')).toBe(true)
  })

  // TC-09 + TC-12: Save to Library persists across reload
  test('Save to Library persists user theme across reload', async ({
    page,
    themeGallery,
  }) => {
    await themeGallery.goto()
    await themeGallery.uploadAndSaveToLibrary(ROSE_THEME, 'rose.json')

    // YOUR THEMES section appears
    await expect(themeGallery.installedSection).toBeVisible()
    expect(await themeGallery.getInstalledThemeCount()).toBe(1)

    // Persists across reload
    await page.reload({ waitUntil: 'networkidle' })
    await themeGallery.goto()
    await expect(themeGallery.installedSection).toBeVisible()
    expect(await themeGallery.getInstalledThemeCount()).toBe(1)
  })

  // TC-10 + TC-12: Save & Apply changes accent and persists
  test('Save & Apply applies tokens globally and persists across reload', async ({
    page,
    themeGallery,
  }) => {
    await themeGallery.goto()
    await themeGallery.uploadAndApply(ROSE_THEME, 'rose.json')

    // Accent changed to rose
    expect(await themeGallery.getCurrentAccent()).toBe('#f472b6')

    // Persists across reload
    await page.reload({ waitUntil: 'networkidle' })
    expect(await themeGallery.getCurrentAccent()).toBe('#f472b6')
  })

  // TC-11: Remove active theme reverts to Midnight
  test('removing active user theme reverts to Midnight', async ({
    page,
    themeGallery,
  }) => {
    await themeGallery.goto()
    await themeGallery.uploadAndApply(ROSE_THEME, 'rose.json')

    // Rose is now active — remove it
    await themeGallery.removeThemeFromGallery('test-rose')

    // Reverts to Midnight
    expect(await themeGallery.getCurrentAccent()).toBe('#14b8a6')
    expect(await themeGallery.isThemeActive('midnight')).toBe(true)

    // YOUR THEMES section disappears
    await expect(themeGallery.installedSection).not.toBeVisible()
  })

  // Reduced motion banner: cross-browser behavior
  test('reduced motion banner appears when OS prefers-reduced-motion', async ({
    page,
    themeGallery,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await setupOnboarded(page)
    await themeGallery.goto()

    await expect(themeGallery.reducedMotionBanner).toBeVisible()
  })

  // TC-12: Reduced motion banner does not reappear after dismiss
  test('reduced motion banner does not reappear after dismiss', async ({
    page,
    themeGallery,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await setupOnboarded(page)
    await themeGallery.goto()

    await expect(themeGallery.reducedMotionBanner).toBeVisible()
    await themeGallery.dismissBannerButton.click()

    await page.reload({ waitUntil: 'networkidle' })
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await themeGallery.goto()
    await expect(themeGallery.reducedMotionBanner).not.toBeVisible()
  })
})
