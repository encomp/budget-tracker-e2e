import { test, expect } from '@playwright/test'
import { FsaStatusPage } from '../pages/FsaStatusPage'
import { seedNoExport } from '../helpers/db'

test.describe('FSA status panel in ExportImport', () => {
  test('FSA status panel is visible on Chromium (FSA supported)', async ({ page }) => {
    await page.goto('/')
    await seedNoExport(page)
    await page.reload()
    const fsa = new FsaStatusPage(page)
    await fsa.goto()
    expect(await fsa.isPanelVisible()).toBe(true)
  })

  test('FSA status panel is not visible on non-FSA context', async ({ page }) => {
    await page.addInitScript(() => {
      // @ts-ignore
      delete window.showDirectoryPicker
    })
    await page.goto('/')
    await seedNoExport(page)
    await page.reload()
    const fsa = new FsaStatusPage(page)
    await fsa.goto()
    expect(await fsa.isPanelVisible()).toBe(false)
  })

  test('reconnect badge not visible when no handle stored', async ({ page }) => {
    await page.goto('/')
    await seedNoExport(page)
    await page.reload()
    const fsa = new FsaStatusPage(page)
    await fsa.goto()
    expect(await fsa.isReconnectBadgeVisible()).toBe(false)
  })

  test('export-import view still fully functional when FSA panel present', async ({ page }) => {
    await page.goto('/')
    await seedNoExport(page)
    await page.reload()
    const fsa = new FsaStatusPage(page)
    await fsa.goto()
    const exportButton = page.getByTestId('export-button')
    await expect(exportButton).toBeVisible()
  })
})
