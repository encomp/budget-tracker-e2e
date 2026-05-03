import { type Page, type Locator } from '@playwright/test'

export class ImportRulesPage {
  readonly page: Page
  readonly view: Locator
  readonly list: Locator
  readonly addButton: Locator
  readonly searchInput: Locator
  readonly emptyState: Locator
  readonly addForm: Locator
  readonly addKeywordInput: Locator
  readonly addCategorySelect: Locator
  readonly addSaveButton: Locator
  readonly addCancelButton: Locator
  readonly duplicateWarning: Locator
  readonly bulkDeleteButton: Locator

  constructor(page: Page) {
    this.page = page
    this.view = page.getByTestId('import-rules-view')
    this.list = page.getByTestId('import-rules-list')
    this.addButton = page.getByTestId('import-rules-add-button')
    this.searchInput = page.getByTestId('import-rules-search')
    this.emptyState = page.getByTestId('import-rules-empty-state')
    this.addForm = page.getByTestId('import-rules-add-form')
    this.addKeywordInput = page.getByTestId('import-rules-add-keyword')
    this.addCategorySelect = page.getByTestId('import-rules-add-category')
    this.addSaveButton = page.getByTestId('import-rules-add-save')
    this.addCancelButton = page.getByTestId('import-rules-add-cancel')
    this.duplicateWarning = page.getByTestId('import-rules-duplicate-warning')
    this.bulkDeleteButton = page.getByTestId('import-rules-bulk-delete')
  }

  async goto(): Promise<void> {
    await this.page.getByTestId('nav-settings').click()
    await this.page.getByText('Import Rules').click()
    await this.view.waitFor({ state: 'visible' })
    // Wait for useLiveQuery (Dexie) to resolve — view shows data-loading="true" while querying
    await this.page.waitForSelector('[data-testid="import-rules-view"]:not([data-loading])', { timeout: 5000 })
  }

  async getRuleCount(): Promise<number> {
    return this.list
      .locator('[data-testid^="import-rule-row-"]')
      .count()
  }

  async addRule(keyword: string, categoryName: string): Promise<void> {
    await this.addButton.click()
    await this.addForm.waitFor({ state: 'visible' })
    await this.addKeywordInput.fill(keyword)
    await this.addCategorySelect.click()
    await this.page.getByRole('option', { name: categoryName }).click()
    await this.addSaveButton.click()
    await this.addForm.waitFor({ state: 'hidden' })
  }

  async deleteRule(ruleId: string): Promise<void> {
    await this.page.getByTestId(`import-rule-delete-${ruleId}`).click()
    await this.page.getByTestId(`import-rule-delete-confirm-${ruleId}`).click()
  }

  async editRule(
    ruleId: string,
    newKeyword: string,
    newCategory: string
  ): Promise<void> {
    await this.page.getByTestId(`import-rule-edit-${ruleId}`).click()
    const keywordInput = this.page.getByTestId(`import-rule-keyword-${ruleId}`)
    await keywordInput.fill(newKeyword)
    const categorySelect = this.page.getByTestId(`import-rule-category-${ruleId}`)
    await categorySelect.click()
    await this.page.getByRole('option', { name: newCategory }).click()
    await this.page.getByTestId(`import-rule-edit-${ruleId}`).click()
  }

  async search(term: string): Promise<void> {
    await this.searchInput.fill(term)
  }

  async clearSearch(): Promise<void> {
    await this.searchInput.fill('')
  }

  async selectRuleByIndex(index: number): Promise<void> {
    const rows = this.list.locator('[data-testid^="import-rule-row-"]')
    const checkbox = rows.nth(index).locator('input[type="checkbox"]')
    // force:true needed on mobile where checkbox is hidden until long-press enters selection mode
    await checkbox.check({ force: true })
  }
}
