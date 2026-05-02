import { test as base, type Page } from '@playwright/test'
import { format } from 'date-fns'
import { DashboardPage } from './pages/DashboardPage'
import { TransactionFormPage } from './pages/TransactionFormPage'
import { ImportPage } from './pages/ImportPage'
import { ThemeGalleryPage } from './pages/ThemeGalleryPage'
import { ImportRulesPage } from './pages/ImportRulesPage'
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

export const AMEX_3COL_CSV = [
  'Date,Description,Amount',
  '01/15/2024,ANTHROPIC SAN FRANCISCO CA,24.00',
  '01/12/2024,ONLINE PAYMENT FROM CHK 1125,-150.00',
  '01/10/2024,WHOLEFDS MKT #10111,52.34',
].join('\n')

export const AMEX_5COL_CSV = [
  'Date,Description,Card Member,Account #,Amount',
  '01/15/2024,ANTHROPIC SAN FRANCISCO CA,TEST USER,12345,24.00',
  '01/12/2024,ONLINE PAYMENT FROM CHK 1125,TEST USER,12345,-150.00',
].join('\n')

export const ALLIANT_CSV = [
  'Date,Description,Amount,Balance',
  '01/15/2024,WHOLEFDS MKT #10111,($52.34),3247.66',
  '01/13/2024,PAYROLL DIRECT DEPOSIT,$3500.00,3315.49',
].join('\n')

export const CITI_CSV = [
  'Date,Description,Debit,Credit',
  '01/15/2024,WHOLEFDS MKT #10111,52.34,',
  '01/13/2024,ONLINE PAYMENT - THANK YOU,,150.00',
].join('\n')

export const PARENTHETICAL_CSV = [
  'Date,Description,Amount,Balance',
  '01/15/2024,COFFEE SHOP,($5.75),3247.66',
  '01/13/2024,PAYCHECK,$3500.00,3300.00',
].join('\n')

type BudgetPilotFixtures = {
  dashboardPage: DashboardPage
  transactionForm: TransactionFormPage
  importPage: ImportPage
  themeGallery: ThemeGalleryPage
  importRulesPage: ImportRulesPage
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
  themeGallery: async ({ page }, use) => {
    await use(new ThemeGalleryPage(page))
  },
  importRulesPage: async ({ page }, use) => {
    await use(new ImportRulesPage(page))
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
