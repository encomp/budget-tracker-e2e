import { type Page, type Locator } from '@playwright/test'

export class DashboardPage {
  readonly page: Page
  readonly incomeCard: Locator
  readonly expensesCard: Locator
  readonly remainingCard: Locator
  readonly savingsRateCard: Locator
  readonly heatmapGrid: Locator
  readonly recentTransactions: Locator
  readonly addButton: Locator
  readonly monthDisplay: Locator
  readonly prevMonthButton: Locator
  readonly nextMonthButton: Locator

  constructor(page: Page) {
    this.page = page
    this.incomeCard        = page.getByTestId('metric-income')
    this.expensesCard      = page.getByTestId('metric-expenses')
    this.remainingCard     = page.getByTestId('metric-remaining')
    this.savingsRateCard   = page.getByTestId('metric-savings-rate')
    this.heatmapGrid       = page.getByTestId('heatmap-calendar')
    this.recentTransactions = page.getByTestId('recent-transactions')
    this.addButton         = page.getByTestId('add-transaction-fab')
    this.monthDisplay      = page.getByTestId('month-display')
    this.prevMonthButton   = page.getByTestId('month-nav-prev')
    this.nextMonthButton   = page.getByTestId('month-nav-next')
  }

  async goto(): Promise<void> {
    await this.page.getByTestId('nav-dashboard').click()
    await this.incomeCard.waitFor({ state: 'visible' })
  }

  async getMetricValue(
    metric: 'income' | 'expenses' | 'remaining' | 'savings-rate'
  ): Promise<string | null> {
    return this.page
      .getByTestId(`metric-${metric}`)
      .getByTestId('metric-value')
      .textContent()
  }

  async getHeatmapCellColor(date: string): Promise<string> {
    const cell = this.page.getByTestId(`heatmap-cell-${date}`)
    return cell.evaluate(
      (el) => getComputedStyle(el).backgroundColor
    )
  }

  async clickAddTransaction(): Promise<void> {
    await this.addButton.click()
  }

  async navigateToPrevMonth(): Promise<void> {
    await this.prevMonthButton.click()
  }

  async navigateToNextMonth(): Promise<void> {
    await this.nextMonthButton.click()
  }

  async getCurrentMonth(): Promise<string | null> {
    return this.monthDisplay.textContent()
  }
}
