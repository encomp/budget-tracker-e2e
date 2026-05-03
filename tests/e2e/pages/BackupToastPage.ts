import { type Page, type Locator } from '@playwright/test'

export class BackupToastPage {
  readonly page: Page
  readonly toast: Locator
  readonly toastMessage: Locator
  readonly toastActionButton: Locator
  readonly toastDismissButton: Locator

  constructor(page: Page) {
    this.page = page
    this.toast = page.getByTestId('global-toast-container')
    this.toastMessage = page.locator('[data-testid="global-toast-container"] [data-testid="toast-message"]')
    this.toastActionButton = page.locator('[data-testid="global-toast-container"] button').first()
    this.toastDismissButton = page.locator('[data-testid="global-toast-container"] button[aria-label="Dismiss"]')
  }

  async waitForToast(): Promise<void> {
    await this.toast.waitFor({ state: 'visible', timeout: 5000 })
  }

  async isToastVisible(): Promise<boolean> {
    return this.toast.isVisible()
  }

  async getToastMessage(): Promise<string> {
    return this.toastMessage.innerText()
  }

  async clickAction(): Promise<void> {
    await this.toastActionButton.click()
  }

  async dismiss(): Promise<void> {
    await this.toastDismissButton.click()
    await this.toast.waitFor({ state: 'hidden', timeout: 3000 })
  }
}
