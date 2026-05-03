import { type Page, type Locator } from '@playwright/test'

export class StartHerePage {
  readonly page: Page
  readonly openAppButton: Locator

  constructor(page: Page) {
    this.page = page
    this.openAppButton = page.getByRole('link', { name: /open app/i })
  }

  async goto(): Promise<void> {
    await this.page.goto('/START_HERE.html')
  }

  async getVisibleSectionId(): Promise<string | null> {
    return this.page.evaluate(() => {
      const sections = document.querySelectorAll<HTMLElement>('.platform-section')
      for (const s of sections) {
        if (s.style.display !== 'none' && s.style.display !== '') return s.id
      }
      return null
    })
  }

  async getHeadlineText(): Promise<string> {
    return this.page
      .locator('.platform-section:not([style*="display: none"]) h1, .platform-section:not([style*="display: none"]) h2')
      .first()
      .innerText()
  }
}
