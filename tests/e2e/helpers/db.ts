import { type Page } from '@playwright/test'
import { format } from 'date-fns'

type AllocationGroup = 'needs' | 'wants' | 'savings'
type ImportSource = 'manual' | 'csv'

interface BpCategory {
  id: string
  name: string
  group: AllocationGroup
}

interface SeedTransaction {
  amount: number
  type: 'expense' | 'income'
  date?: string
  categoryId?: string | null
  note?: string
  importSource?: ImportSource
}

interface SeedDebt {
  name: string
  balance: number
  apr: number
  minPayment: number
}

interface BudgetLimitOverride {
  categoryName: string
  limit: number
}

const ONBOARDING_CATEGORIES: Array<{ name: string; group: AllocationGroup }> = [
  { name: 'Housing',        group: 'needs' },
  { name: 'Groceries',      group: 'needs' },
  { name: 'Utilities',      group: 'needs' },
  { name: 'Transport',      group: 'needs' },
  { name: 'Health',         group: 'needs' },
  { name: 'Dining Out',     group: 'wants' },
  { name: 'Entertainment',  group: 'wants' },
  { name: 'Shopping',       group: 'wants' },
  { name: 'Personal Care',  group: 'wants' },
  { name: 'Emergency Fund', group: 'savings' },
  { name: 'Investments',    group: 'savings' },
  { name: 'Vacation Fund',  group: 'savings' },
]

export async function resetDB(page: Page): Promise<void> {
  await page.evaluate(async () => {
    await new Promise<void>((resolve, reject) => {
      const req = indexedDB.deleteDatabase('BudgetPilotDB')
      req.onsuccess = () => resolve()
      req.onerror = () => reject(new Error('Failed to delete IndexedDB'))
      req.onblocked = () => {
        req.onsuccess = () => resolve()
      }
    })
  })
  await page.reload({ waitUntil: 'networkidle' })
  // Reset Zustand store's installedThemes so parallel tests don't bleed
  // installed theme state from a previous test into the next one.
  // After page reload, boot() sets installedThemes from DB (now empty),
  // but we also reset here as belt-and-suspenders.
  await page.evaluate(async () => {
    // @ts-ignore — browser-context dynamic import resolved at runtime by Vite
    const { useAppStore } = await import('/src/store/useAppStore.ts')
    useAppStore.getState().setInstalledThemes([])
  })
}

export async function seedOnboardedState(
  page: Page,
  options: {
    name?: string
    currency?: string
    monthlyIncome?: number
    month?: string
  } = {}
): Promise<void> {
  const {
    name = 'Test User',
    currency = '$',
    monthlyIncome = 5000,
    month = format(new Date(), 'yyyy-MM'),
  } = options

  await page.evaluate(
    async ({ name, currency, monthlyIncome, month, categories }) => {
      // @ts-ignore — browser-context dynamic import resolved at runtime by Vite
      const { db } = await import('/src/lib/db.ts')
      // @ts-ignore — browser-context dynamic import resolved at runtime by Vite
      const { Settings } = await import('/src/lib/settings.ts')

      await db.profile.add({
        name,
        currency,
        createdAt: new Date().toISOString().slice(0, 10),
      })

      const catsWithIds: BpCategory[] = categories.map(
        (c: { name: string; group: string }) => ({
          id: crypto.randomUUID(),
          name: c.name,
          group: c.group as AllocationGroup,
        })
      )

      await db.budgets.add({
        month,
        monthlyIncome,
        allocation: { needs: 50, wants: 30, savings: 20 },
        categories: catsWithIds,
        categoryLimits: catsWithIds.map((c: BpCategory) => ({
          categoryId: c.id,
          limit: 0,
        })),
      })

      await Settings.set('onboardingCompleted', true)
    },
    { name, currency, monthlyIncome, month, categories: ONBOARDING_CATEGORIES }
  )

  await page.reload({ waitUntil: 'networkidle' })
}

export async function seedTransactions(
  page: Page,
  transactions: SeedTransaction[]
): Promise<string[]> {
  return page.evaluate(async (txns) => {
    // @ts-ignore — browser-context dynamic import resolved at runtime by Vite
    const { db } = await import('/src/lib/db.ts')
    const today = new Date().toISOString().slice(0, 10)
    const ids: string[] = []

    for (const txn of txns) {
      const id = crypto.randomUUID()
      ids.push(id)
      await db.transactions.add({
        id,
        date: txn.date ?? today,
        amount: txn.amount,
        type: txn.type,
        categoryId: txn.categoryId ?? null,
        note: txn.note ?? '',
        importSource: txn.importSource ?? 'manual',
      })
    }
    return ids
  }, transactions)
}

export async function seedBudgetWithLimits(
  page: Page,
  month: string,
  limits: BudgetLimitOverride[]
): Promise<void> {
  await page.evaluate(
    async ({ month, limits }) => {
      // @ts-ignore — browser-context dynamic import resolved at runtime by Vite
      const { db } = await import('/src/lib/db.ts')
      const budget = await db.budgets.where('month').equals(month).first()

      if (!budget) {
        throw new Error(
          `seedBudgetWithLimits: no budget found for month "${month}". ` +
          `Did you call seedOnboardedState first?`
        )
      }

      const updatedLimits = budget.categoryLimits.map(
        (cl: { categoryId: string; limit: number }) => {
          const cat = budget.categories?.find(
            (c: { id: string }) => c.id === cl.categoryId
          )
          const override = limits.find(
            (l: { categoryName: string }) =>
              l.categoryName.toLowerCase() === cat?.name?.toLowerCase()
          )
          return override ? { ...cl, limit: override.limit } : cl
        }
      )

      await db.budgets.where('month').equals(month).modify({
        categoryLimits: updatedLimits,
      })
    },
    { month, limits }
  )
}

export async function seedDebts(
  page: Page,
  debts: SeedDebt[]
): Promise<string[]> {
  return page.evaluate(async (debts) => {
    // @ts-ignore — browser-context dynamic import resolved at runtime by Vite
    const { db } = await import('/src/lib/db.ts')
    const ids: string[] = []
    for (const debt of debts) {
      const id = crypto.randomUUID()
      ids.push(id)
      await db.debts.add({ id, ...debt })
    }
    return ids
  }, debts)
}

export async function getCategoryId(
  page: Page,
  categoryName: string,
  month: string
): Promise<string | null> {
  return page.evaluate(
    async ({ categoryName, month }) => {
      // @ts-ignore — browser-context dynamic import resolved at runtime by Vite
      const { db } = await import('/src/lib/db.ts')
      const budget = await db.budgets.where('month').equals(month).first()
      const cat = budget?.categories?.find(
        (c: { name: string }) =>
          c.name.toLowerCase() === categoryName.toLowerCase()
      )
      return cat?.id ?? null
    },
    { categoryName, month }
  )
}

export async function seedSetting(
  page: Page,
  key: string,
  value: unknown
): Promise<void> {
  await page.evaluate(
    async ({ key, value }) => {
      // @ts-ignore — browser-context dynamic import resolved at runtime by Vite
      const { Settings } = await import('/src/lib/settings.ts')
      await Settings.set(key, value)
    },
    { key, value }
  )
}

interface SeedImportRule {
  keyword: string
  categoryName: string
}

export async function seedImportRules(
  page: Page,
  rules: SeedImportRule[]
): Promise<void> {
  await page.evaluate(async (rules) => {
    // @ts-ignore — browser-context dynamic import resolved at runtime by Vite
    const { db } = await import('/src/lib/db.ts')
    const budgets = await db.budgets.toArray()
    const allCategories = budgets.flatMap(
      (b: { categories?: Array<{ id: string; name: string }> }) =>
        b.categories ?? []
    )

    for (const rule of rules) {
      const cat = allCategories.find(
        (c: { name: string }) =>
          c.name.toLowerCase() === rule.categoryName.toLowerCase()
      )
      if (!cat) continue

      try {
        await (db as any).importRules?.put({
          id: crypto.randomUUID(),
          keyword: rule.keyword.toLowerCase().trim(),
          categoryId: cat.id,
          createdAt: new Date().toISOString().slice(0, 10),
        })
      } catch {
        await db.csvCategoryMap.put({
          normalizedDescription: rule.keyword.toLowerCase().trim(),
          categoryId: cat.id,
        })
      }
    }
  }, rules)
}
