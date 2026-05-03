import { type Page, type Locator } from '@playwright/test'

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
    await this.page.getByTestId('nav-export-import').waitFor({ state: 'visible', timeout: 10000 })
    await this.page.getByTestId('nav-export-import').click()
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
