import { redirect } from 'next/navigation'
import { FinanceLinksPanel } from '@/components/finances/FinanceLinksPanel'
import { FinancesList } from '@/components/finances/FinancesList'
import { FinanceSummary } from '@/components/finances/FinanceSummary'
import { MonthPicker } from '@/components/finances/MonthPicker'
import { getCurrentUser } from '@/lib/auth'
import { getFinanceLinks, getFinances } from '@/lib/actions/finances'
import { currentMonth, monthLabel } from '@/lib/utils'

interface Props {
  searchParams: Promise<{ month?: string }>
}

export default async function FinancesPage({ searchParams }: Props) {
  const user = await getCurrentUser()

  if (!user) redirect('/auth/login')

  const params = await searchParams
  const month = params.month ?? currentMonth()
  const [finances, financeLinks] = await Promise.all([
    getFinances(month),
    getFinanceLinks(),
  ])

  return (
    <div className="space-y-5 pb-4">
      <div className="flex items-start justify-between pt-2">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Financas</h1>
          <p className="mt-0.5 text-sm capitalize text-zinc-400 dark:text-zinc-500">
            {monthLabel(month)}
          </p>
        </div>
        <MonthPicker current={month} />
      </div>

      <FinanceLinksPanel links={financeLinks} />

      <FinanceSummary
        balance={finances.balance}
        totalIncome={finances.totalIncome}
        totalExpenses={finances.totalExpenses}
      />

      <FinancesList entries={finances.entries} />
    </div>
  )
}
