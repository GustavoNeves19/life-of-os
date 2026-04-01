'use client'

import { useState } from 'react'
import { Trash2, TrendingUp, TrendingDown } from 'lucide-react'
import { deleteFinancialEntry } from '@/lib/actions/finances'
import { formatCurrency, formatDateShort } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { FinancialEntry } from '@/types'

interface Props {
  entries: FinancialEntry[]
}

const categoryIcons: Record<string, string> = {
  'Alimentação': '🍔', 'Transporte': '🚌', 'Moradia': '🏠',
  'Saúde': '❤️', 'Educação': '📚', 'Lazer': '🎮',
  'Roupas': '👕', 'Tecnologia': '💻', 'Assinaturas': '📱',
  'Salário': '💼', 'Freelance': '🧑‍💻', 'Investimentos': '📈',
  'Bônus': '🎁', 'Outros': '📦',
}

export function FinancesList({ entries }: Props) {
  const [deleting, setDeleting] = useState<string | null>(null)

  async function handleDelete(id: string) {
    if (!confirm('Remover este lançamento?')) return
    setDeleting(id)
    await deleteFinancialEntry(id)
    setDeleting(null)
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-12 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800">
        <p className="text-zinc-400">Nenhum lançamento neste mês</p>
        <p className="text-xs text-zinc-300 dark:text-zinc-600 mt-1">Toque no + para adicionar</p>
      </div>
    )
  }

  // Group by date
  const grouped = entries.reduce((acc, entry) => {
    const key = entry.date
    if (!acc[key]) acc[key] = []
    acc[key].push(entry)
    return acc
  }, {} as Record<string, FinancialEntry[]>)

  return (
    <section className="space-y-4">
      <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
        Lançamentos · {entries.length}
      </h2>

      {Object.entries(grouped)
        .sort(([a], [b]) => b.localeCompare(a))
        .map(([date, dayEntries]) => (
          <div key={date}>
            <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500 mb-2 px-1">
              {formatDateShort(date)}
            </p>
            <div className="space-y-2">
              {dayEntries.map(entry => (
                <div
                  key={entry.id}
                  className={cn(
                    'group flex items-center gap-3 p-3.5 rounded-xl bg-white dark:bg-zinc-900 border transition-all',
                    entry.type === 'income'
                      ? 'border-emerald-100 dark:border-emerald-900/40'
                      : 'border-zinc-100 dark:border-zinc-800'
                  )}
                >
                  {/* Category icon */}
                  <div className={cn(
                    'w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0',
                    entry.type === 'income'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40'
                      : 'bg-zinc-50 dark:bg-zinc-800'
                  )}>
                    {categoryIcons[entry.category] ?? '💰'}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100 leading-snug">
                      {entry.category}
                    </p>
                    {entry.description && (
                      <p className="text-xs text-zinc-400 dark:text-zinc-500 truncate mt-0.5">
                        {entry.description}
                      </p>
                    )}
                  </div>

                  {/* Amount */}
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      'text-sm font-semibold',
                      entry.type === 'income'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-zinc-800 dark:text-zinc-200'
                    )}>
                      {entry.type === 'income' ? '+' : '-'}
                      {formatCurrency(entry.amount)}
                    </span>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      disabled={deleting === entry.id}
                      className="opacity-0 group-hover:opacity-100 p-1 text-zinc-300 hover:text-red-400 transition-all disabled:opacity-30"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
    </section>
  )
}
