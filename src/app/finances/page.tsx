import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getFinances } from '@/lib/actions/finances'
import { FinancesList } from '@/components/finances/FinancesList'
import { FinanceSummary } from '@/components/finances/FinanceSummary'
import { MonthPicker } from '@/components/finances/MonthPicker'
import { currentMonth, monthLabel } from '@/lib/utils'

interface Props {
  searchParams: Promise<{ month?: string }>
}

export default async function FinancesPage({ searchParams }: Props) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const params = await searchParams
  const month = params.month ?? currentMonth()
  const finances = await getFinances(month)

  return (
    <div className="space-y-5 pb-4">
      <div className="pt-2 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Finanças</h1>
          <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-0.5 capitalize">
            {monthLabel(month)}
          </p>
        </div>
        <MonthPicker current={month} />
      </div>

      <FinanceSummary
        balance={finances.balance}
        totalIncome={finances.totalIncome}
        totalExpenses={finances.totalExpenses}
      />

      <FinancesList entries={finances.entries} />
    </div>
  )
}
