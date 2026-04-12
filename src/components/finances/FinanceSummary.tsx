import { TrendingUp, TrendingDown } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface Props {
  balance: number
  totalIncome: number
  totalExpenses: number
}

export function FinanceSummary({ balance, totalIncome, totalExpenses }: Props) {
  const expensePercent = totalIncome > 0
    ? Math.min(100, Math.round((totalExpenses / totalIncome) * 100))
    : 0

  return (
    <div className="space-y-3">
      {/* Balance card */}
      <div className={cn(
        'rounded-2xl p-5 text-center',
        balance >= 0
          ? 'bg-gradient-to-br from-emerald-500 to-teal-600'
          : 'bg-gradient-to-br from-red-500 to-rose-600'
      )}>
        <p className="text-emerald-100 text-xs font-medium mb-1 opacity-80">Saldo do mês</p>
        <p className="text-3xl font-bold text-white tracking-tight">
          {formatCurrency(balance)}
        </p>
        {totalIncome > 0 && (
          <div className="mt-3 space-y-1">
            <div className="flex justify-between text-xs text-white/70 mb-1">
              <span>Despesas</span>
              <span>{expensePercent}% da receita</span>
            </div>
            <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white/60 rounded-full transition-all duration-700"
                style={{ width: `${expensePercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Income / Expense grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl flex items-center justify-center">
              <TrendingUp size={15} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-xs text-zinc-400 font-medium">Receitas</p>
          </div>
          <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
            {formatCurrency(totalIncome)}
          </p>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-red-50 dark:bg-red-950/40 rounded-xl flex items-center justify-center">
              <TrendingDown size={15} className="text-red-500 dark:text-red-400" />
            </div>
            <p className="text-xs text-zinc-400 font-medium">Despesas</p>
          </div>
          <p className="text-lg font-bold text-red-600 dark:text-red-400">
            {formatCurrency(totalExpenses)}
          </p>
        </div>
      </div>
    </div>
  )
}
