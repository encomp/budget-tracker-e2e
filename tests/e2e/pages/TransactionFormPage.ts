import { type Page, type Locator } from '@playwright/test'

export class TransactionFormPage {
  readonly page: Page
  readonly modal: Locator
  readonly dateInput: Locator
  readonly amountInput: Locator
  readonly expenseToggle: Locator
  readonly incomeToggle: Locator
  readonly categorySelect: Locator
  readonly noteInput: Locator
  readonly saveButton: Locator
  readonly cancelButton: Locator

  constructor(page: Page) {
    this.page           = page
    this.modal          = page.getByTestId('transaction-modal')
    this.dateInput      = page.getByTestId('txn-date')
    this.amountInput    = page.getByTestId('txn-amount')
    this.expenseToggle  = page.getByTestId('txn-type-expense')
    this.incomeToggle   = page.getByTestId('txn-type-income')
    this.categorySelect = page.getByTestId('txn-category')
    this.noteInput      = page.getByTestId('txn-note')
    this.saveButton     = page.getByTestId('txn-save')
    this.cancelButton   = page.getByTestId('txn-cancel')
  }

  async waitForOpen(): Promise<void> {
    await this.modal.waitFor({ state: 'visible' })
  }

  async waitForClose(): Promise<void> {
    await this.modal.waitFor({ state: 'hidden' })
  }

  async fillTransaction(data: {
    amount: string
    type?: 'expense' | 'income'
    category?: string
    note?: string
    date?: string
  }): Promise<void> {
    if (data.date) {
      await this.dateInput.fill(data.date)
    }
    await this.amountInput.fill(data.amount)
    if (data.type === 'income') {
      await this.incomeToggle.click()
    } else {
      await this.expenseToggle.click()
    }
    if (data.category) {
      await this.categorySelect.click()
      await this.page
        .getByRole('option', { name: data.category })
        .click()
    }
    if (data.note) {
      await this.noteInput.fill(data.note)
    }
  }

  async submit(): Promise<void> {
    await this.saveButton.click()
  }

  async submitAndWaitForClose(): Promise<void> {
    await this.saveButton.click()
    await this.waitForClose()
  }
}
