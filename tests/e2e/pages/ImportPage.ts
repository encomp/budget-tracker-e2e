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

  constructor(page: Page) {
    this.page                 = page
    this.stepper              = page.getByTestId('import-stepper')
    this.dropzone             = page.getByTestId('import-dropzone')
    this.fileInput            = page.getByTestId('import-file-input')
    this.bankDetectedToast    = page.getByTestId('toast-bank-detected')
    this.previewTable         = page.getByTestId('import-preview-table')
    this.importButton         = page.getByTestId('import-confirm-button')
    this.confirmMappingButton = page.getByTestId('import-confirm-mapping')
  }

  async goto(): Promise<void> {
    await this.page.getByTestId('nav-import').click()
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
}
