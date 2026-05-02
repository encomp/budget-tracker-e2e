import { type Page, type Locator } from '@playwright/test'

export class ImportPage {
  readonly page: Page
  readonly stepper: Locator
  readonly dropzone: Locator
  readonly fileInput: Locator
  readonly bankDetectedToast: Locator
  readonly previewTable: Locator
  readonly importButton: Locator
  readonly confirmMappingButton: Locator
  readonly ruleCountSummary: Locator
  readonly conflictPanel: Locator
  readonly reviewConflictsButton: Locator
  readonly importWithoutRulesButton: Locator
  readonly startOverButton: Locator
  readonly bankAmexToast: Locator
  readonly bankCitiToast: Locator

  constructor(page: Page) {
    this.page                  = page
    this.stepper               = page.getByTestId('import-stepper')
    this.dropzone              = page.getByTestId('import-dropzone')
    this.fileInput             = page.getByTestId('import-file-input').first()
    this.bankDetectedToast     = page.getByTestId('toast-bank-detected')
    this.previewTable          = page.getByTestId('import-preview-table')
    this.importButton          = page.getByTestId('import-confirm-button')
    this.confirmMappingButton  = page.getByTestId('import-confirm-mapping')
    this.ruleCountSummary      = page.getByTestId('import-rule-count-summary')
    this.conflictPanel         = page.getByTestId('import-conflict-panel')
    this.reviewConflictsButton = page.getByTestId('import-conflict-review')
    this.importWithoutRulesButton = page.getByTestId('import-without-rules')
    this.startOverButton       = page.getByTestId('import-start-over')
    this.bankAmexToast         = page.getByTestId('toast-bank-amex')
    this.bankCitiToast         = page.getByTestId('toast-bank-citi')
  }

  async goto(): Promise<void> {
    await this.page.evaluate(async () => {
      // @ts-ignore — browser-context dynamic import resolved at runtime by Vite
      const { useAppStore } = await import('/src/store/useAppStore.ts')
      useAppStore.getState().setActiveView('import')
    })
    await this.stepper.waitFor({ state: 'visible' })
  }

  async uploadCSV(
    csvContent: string,
    filename = 'test.csv'
  ): Promise<void> {
    await this.fileInput.setInputFiles({
      name: filename,
      mimeType: 'text/csv',
      buffer: Buffer.from(csvContent),
    })
  }

  async getPreviewRowCount(): Promise<number> {
    return this.previewTable.getByTestId('preview-row').count()
  }

  async getUncategorizedCount(): Promise<number> {
    return this.previewTable.getByTestId('badge-uncategorized').count()
  }

  async assignCategoryToRow(rowIndex: number, categoryName: string): Promise<void> {
    const row = this.previewTable
      .getByTestId('preview-row')
      .nth(rowIndex)
    await row.getByRole('combobox').click()
    await this.page.getByRole('option', { name: categoryName }).click()
  }

  async getRuleCountSummaryText(): Promise<string | null> {
    return this.ruleCountSummary.textContent()
  }

  async hasConflict(): Promise<boolean> {
    return this.conflictPanel.isVisible()
  }

  async toggleRuleForRow(rowIndex: number, checked: boolean): Promise<void> {
    const toggle = this.page.getByTestId(`import-rule-toggle-${rowIndex}`)
    const current = await toggle.isChecked()
    if (current !== checked) await toggle.click()
  }

  async getRuleKeyForRow(rowIndex: number): Promise<string | null> {
    return this.page
      .getByTestId(`import-rule-key-${rowIndex}`)
      .inputValue()
  }

  async setRuleKeyForRow(rowIndex: number, key: string): Promise<void> {
    const input = this.page.getByTestId(`import-rule-key-${rowIndex}`)
    await input.click()  // unlock editing (triggers onClick in app that sets ruleKeyOverrides)
    await this.page.waitForTimeout(100)  // allow React state update
    await input.fill(key)
    await input.press('Tab')
  }
}
