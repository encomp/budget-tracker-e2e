import { type Page, type Locator } from '@playwright/test'
import { clickNavItem } from '../helpers/nav'

export class FsaStatusPage {
  readonly page: Page
  readonly statusPanel: Locator
  readonly reconnectBadge: Locator
  readonly reconnectButton: Locator
  readonly dismissReconnectButton: Locator

  constructor(page: Page) {
    this.page = page
    this.statusPanel = page.getByTestId('fsa-status-panel')
    this.reconnectBadge = page.getByTestId('fsa-reconnect-badge')
    this.reconnectButton = page.getByTestId('fsa-reconnect-confirm')
    this.dismissReconnectButton = page.getByTestId('fsa-reconnect-dismiss')
  }

  async goto(): Promise<void> {
    const viewport = this.page.viewportSize()
    const isMobile = viewport !== null && viewport.width < 768
    const waitTestId = isMobile ? 'nav-more' : 'nav-export-import'
    await this.page.getByTestId(waitTestId).waitFor({ state: 'visible', timeout: 10000 })
    await clickNavItem(this.page, 'nav-export-import')
    await this.page.waitForSelector(
      '[data-testid="fsa-status-panel"], [data-testid="last-export-date"]',
      { timeout: 5000 }
    )
  }

  async isPanelVisible(): Promise<boolean> {
    return this.statusPanel.isVisible()
  }

  async isReconnectBadgeVisible(): Promise<boolean> {
    return this.reconnectBadge.isVisible()
  }
}
