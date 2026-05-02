import { test, expect, setupOnboarded } from '../fixtures'
import { ROSE_THEME, INVALID_THEME } from '../fixtures/themes'

test.describe('Theme Engine @tier1', () => {
  test.beforeEach(async ({ page }) => {
    await setupOnboarded(page)
    await page.getByTestId('nav-settings').click()
    await page.waitForLoadState('networkidle')
  })

  test('valid theme applies --bp-accent from uploaded JSON', async ({ page }) => {
    await page.getByTestId('theme-dropzone').setInputFiles({
      name: 'rose.json',
      mimeType: 'application/json',
      buffer: Buffer.from(JSON.stringify(ROSE_THEME)),
    })

    await expect(page.getByTestId('theme-preview-panel')).toBeVisible()
    await page.getByTestId('theme-save-and-apply-button').click()

    const accent = await page.evaluate(() =>
      getComputedStyle(document.documentElement)
        .getPropertyValue('--bp-accent')
        .trim()
    )
    expect(accent).toBe('#f472b6')
  })

  test('invalid theme shows error toast and keeps current theme', async ({
    page,
  }) => {
    const currentAccent = await page.evaluate(() =>
      getComputedStyle(document.documentElement)
        .getPropertyValue('--bp-accent')
        .trim()
    )

    await page.getByTestId('theme-dropzone').setInputFiles({
      name: 'bad.json',
      mimeType: 'application/json',
      buffer: Buffer.from(JSON.stringify(INVALID_THEME)),
    })

    await expect(page.getByTestId('toast-container')).toBeVisible()
    await expect(page.getByTestId('toast-message')).toContainText('Invalid theme')
    await expect(page.getByTestId('theme-preview-panel')).not.toBeVisible()

    const accentAfter = await page.evaluate(() =>
      getComputedStyle(document.documentElement)
        .getPropertyValue('--bp-accent')
        .trim()
    )
    expect(accentAfter).toBe(currentAccent)
  })

  test('applied theme persists across page reload', async ({ page }) => {
    await page.getByTestId('theme-dropzone').setInputFiles({
      name: 'rose.json',
      mimeType: 'application/json',
      buffer: Buffer.from(JSON.stringify(ROSE_THEME)),
    })
    await expect(page.getByTestId('theme-preview-panel')).toBeVisible()
    await page.getByTestId('theme-save-and-apply-button').click()
    await page.reload({ waitUntil: 'networkidle' })

    const accent = await page.evaluate(() =>
      getComputedStyle(document.documentElement)
        .getPropertyValue('--bp-accent')
        .trim()
    )
    expect(accent).toBe('#f472b6')
  })

  test('Reset to Midnight restores --bp-accent to teal', async ({ page }) => {
    await page.getByTestId('theme-dropzone').setInputFiles({
      name: 'rose.json',
      mimeType: 'application/json',
      buffer: Buffer.from(JSON.stringify(ROSE_THEME)),
    })
    await expect(page.getByTestId('theme-preview-panel')).toBeVisible()
    await page.getByTestId('theme-save-and-apply-button').click()

    await page.getByTestId('theme-card-apply-midnight').click()

    const accent = await page.evaluate(() =>
      getComputedStyle(document.documentElement)
        .getPropertyValue('--bp-accent')
        .trim()
    )
    expect(accent).toBe('#14b8a6')
  })
})
