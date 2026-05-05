import { test, expect, CURRENT_MONTH, setupOnboarded } from '../fixtures'
import { seedTransactions, getCategoryId } from '../helpers/db'

// Use fixed days in the current month that are always valid (1st and 2nd of month).
// These cells always exist in the heatmap grid regardless of today's date.
const dateA = `${CURRENT_MONTH}-02`
const dateB = `${CURRENT_MONTH}-03`

// ── Desktop viewport — tooltip stability + universality ───────────────────────

test.describe('Heatmap Tooltip @tier1', () => {
  test.use({ viewport: { width: 1280, height: 800 } })

  test.beforeEach(async ({ page }) => {
    await setupOnboarded(page)

    const catId = await getCategoryId(page, 'Groceries', CURRENT_MONTH)
    await seedTransactions(page, [
      { amount: 65.00, type: 'expense', categoryId: catId, date: dateA },
      { amount: 120.50, type: 'expense', categoryId: catId, date: dateB },
    ])

    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.getByTestId('heatmap-calendar').waitFor({ state: 'visible' })
  })

  test('tooltip container is at a fixed position (top:0, right:0) inside the heatmap', async ({ page }) => {
    const tooltipContainer = page.getByTestId('heatmap-tooltip')

    // Verify static positioning style — not using fixed/viewport coordinates
    const position = await tooltipContainer.evaluate((el) => (el as HTMLElement).style.position)
    const top = await tooltipContainer.evaluate((el) => (el as HTMLElement).style.top)
    const right = await tooltipContainer.evaluate((el) => (el as HTMLElement).style.right)

    expect(position).toBe('absolute')
    expect(top).toBe('0px')
    expect(right).toBe('0px')
  })

  test('tooltip position does not change between hovering two different cells', async ({ page }) => {
    const tooltipContainer = page.getByTestId('heatmap-tooltip')

    // Hover cell A
    const cellA = page.getByTestId(`heatmap-cell-${dateA}`)
    await cellA.hover()
    await expect(tooltipContainer).toBeVisible()
    const boxA = await tooltipContainer.boundingBox()

    // Hover cell B
    const cellB = page.getByTestId(`heatmap-cell-${dateB}`)
    await cellB.hover()
    await expect(tooltipContainer).toBeVisible()
    const boxB = await tooltipContainer.boundingBox()

    expect(boxA).not.toBeNull()
    expect(boxB).not.toBeNull()

    // Position must be identical — this is the regression guard for "stable tooltip"
    expect(boxA!.x).toBeCloseTo(boxB!.x, 0)
    expect(boxA!.y).toBeCloseTo(boxB!.y, 0)
    expect(boxA!.width).toBeCloseTo(boxB!.width, 0)
  })

  test('tooltip content changes to reflect the hovered cell', async ({ page }) => {
    const tooltipContainer = page.getByTestId('heatmap-tooltip')

    await page.getByTestId(`heatmap-cell-${dateA}`).hover()
    await expect(tooltipContainer).toBeVisible()
    const textA = await tooltipContainer.textContent()

    await page.getByTestId(`heatmap-cell-${dateB}`).hover()
    await expect(tooltipContainer).toBeVisible()
    const textB = await tooltipContainer.textContent()

    // Both cells show formatted currency
    expect(textA).toMatch(/\$\d/)
    expect(textB).toMatch(/\$\d/)
    // Content must differ between the two cells
    expect(textA).not.toEqual(textB)
  })

  test('every cell with a transaction shows a tooltip on hover', async ({ page }) => {
    const tooltipContainer = page.getByTestId('heatmap-tooltip')

    for (const dateStr of [dateA, dateB]) {
      const cell = page.getByTestId(`heatmap-cell-${dateStr}`)
      await cell.hover()
      await expect(tooltipContainer).toBeVisible({ timeout: 500 })
      // Move off before next hover
      await page.mouse.move(0, 0)
    }
  })

  test('empty cells do not show a tooltip', async ({ page }) => {
    const tooltipContainer = page.getByTestId('heatmap-tooltip')

    // Find the first cell-empty cell (zero spend)
    const emptyCell = page.locator('[data-heatmap="cell-empty"]').first()
    await emptyCell.hover()

    // Tooltip container should remain hidden (opacity 0)
    const opacity = await tooltipContainer.evaluate((el) => (el as HTMLElement).style.opacity)
    expect(opacity).toBe('0')
  })

  test('tooltip does not overlap the donut chart', async ({ page }) => {
    const tooltipContainer = page.getByTestId('heatmap-tooltip')
    const donut = page.getByTestId('spending-donut').or(page.locator('[data-testid="donut-chart"]'))

    await page.getByTestId(`heatmap-cell-${dateA}`).hover()
    await expect(tooltipContainer).toBeVisible()

    const tooltipBox = await tooltipContainer.boundingBox()

    // If donut exists on this viewport, verify no overlap
    if (await donut.isVisible()) {
      const donutBox = await donut.boundingBox()
      if (tooltipBox && donutBox) {
        const overlapsX = tooltipBox.x < donutBox.x + donutBox.width && tooltipBox.x + tooltipBox.width > donutBox.x
        const overlapsY = tooltipBox.y < donutBox.y + donutBox.height && tooltipBox.y + tooltipBox.height > donutBox.y
        expect(overlapsX && overlapsY).toBe(false)
      }
    }
  })
})
