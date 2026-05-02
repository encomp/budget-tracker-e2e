import { test as base, type Page } from '@playwright/test'
import { format } from 'date-fns'
import { DashboardPage } from './pages/DashboardPage'
import { TransactionFormPage } from './pages/TransactionFormPage'
import { ImportPage } from './pages/ImportPage'
import { resetDB, seedOnboardedState } from './helpers/db'

export const CURRENT_MONTH = format(new Date(), 'yyyy-MM')

export const CHASE_CSV = [
  'Transaction Date,Post Date,Description,Category,Type,Amount,Memo',
  '04/15/2026,04/16/2026,STARBUCKS #12345,Food & Drink,Sale,-5.75,',
  '04/14/2026,04/15/2026,WHOLE FOODS #890,Groceries,Sale,-87.43,',
  '04/13/2026,04/13/2026,PAYCHECK DIRECT DEP,Income,Payment,3500.00,',
  '04/12/2026,04/12/2026,NETFLIX.COM,Entertainment,Sale,-15.99,',
  '04/10/2026,04/10/2026,UNKNOWN MERCHANT XYZ,Other,Sale,-23.50,',
].join('\n')

export const UNKNOWN_CSV = [
  'TXN_DATE,MERCHANT_NAME,DEBIT_AMT',
  '2026-04-15,Coffee Shop,5.75',
  '2026-04-14,Grocery Store,45.99',
].join('\n')

type BudgetPilotFixtures = {
  dashboardPage: DashboardPage
  transactionForm: TransactionFormPage
  importPage: ImportPage
}

export const test = base.extend<BudgetPilotFixtures>({
  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page))
  },
  transactionForm: async ({ page }, use) => {
    await use(new TransactionFormPage(page))
  },
  importPage: async ({ page }, use) => {
    await use(new ImportPage(page))
  },
})

export { expect } from '@playwright/test'

export async function setupOnboarded(
  page: Page,
  options?: Parameters<typeof seedOnboardedState>[1]
): Promise<void> {
  await page.goto('/')
  await resetDB(page)
  await seedOnboardedState(page, options)
}
