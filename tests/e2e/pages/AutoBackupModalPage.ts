import { type Page, type Locator } from '@playwright/test'

export class AutoBackupModalPage {
  readonly page: Page
  readonly modal: Locator
  readonly modalBody: Locator
  readonly primaryButton: Locator
  readonly secondaryButton: Locator
  readonly successState: Locator
  readonly errorState: Locator

  constructor(page: Page) {
    this.page = page
    this.modal = page.getByTestId('autobackup-modal')
    this.modalBody = page.getByTestId('autobackup-modal-body')
    this.primaryButton = page.getByTestId('autobackup-modal-primary')
    this.secondaryButton = page.getByTestId('autobackup-modal-secondary')
    this.successState = page.getByTestId('autobackup-modal-success')
    this.errorState = page.getByTestId('autobackup-modal-error')
  }

  async waitForModal(): Promise<void> {
    await this.modal.waitFor({ state: 'visible', timeout: 5000 })
  }

  async isVisible(): Promise<boolean> {
    return this.modal.isVisible()
  }

  async clickPrimary(): Promise<void> {
    await this.primaryButton.click()
  }

  async clickSecondary(): Promise<void> {
    await this.secondaryButton.click()
    await this.modal.waitFor({ state: 'hidden', timeout: 3000 })
  }

  async getPrimaryButtonText(): Promise<string> {
    return this.primaryButton.innerText()
  }
}
