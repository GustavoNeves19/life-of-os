'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { deleteFinancialEntry } from '@/lib/actions/finances'
import { cn, formatCurrency, formatDateShort } from '@/lib/utils'
import type { FinancialEntry } from '@/types'

interface Props {
  entries: FinancialEntry[]
}

const categoryIcons: Record<string, string> = {
  Alimentacao: '🍔',
  'AlimentaÃ§Ã£o': '🍔',
  Transporte: '🚌',
  Moradia: '🏠',
  Saude: '❤️',
  'SaÃºde': '❤️',
  Educacao: '📚',
  'EducaÃ§Ã£o': '📚',
  Lazer: '🎮',
  Roupas: '👕',
  Tecnologia: '💻',
  Assinaturas: '📱',
  Salario: '💼',
  'SalÃ¡rio': '💼',
  Freelance: '🧑‍💻',
  Investimentos: '📈',
  Bonus: '🎁',
  'BÃ´nus': '🎁',
  Outros: '📦',
}

export function FinancesList({ entries }: Props) {
  const [deleting, setDeleting] = useState<string | null>(null)

  async function handleDelete(id: string) {
    if (!confirm('Remover este lancamento?')) return

    setDeleting(id)
    await deleteFinancialEntry(id)
    setDeleting(null)
  }

  if (entries.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 py-12 text-center dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-zinc-400">Nenhum lancamento neste mes</p>
        <p className="mt-1 text-xs text-zinc-300 dark:text-zinc-600">
          Toque no + para adicionar
        </p>
      </div>
    )
  }

  const grouped = entries.reduce((acc, entry) => {
    const key = entry.date
    if (!acc[key]) acc[key] = []
    acc[key].push(entry)
    return acc
  }, {} as Record<string, FinancialEntry[]>)

  return (
    <section className="space-y-4">
      <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
        Lancamentos · {entries.length}
      </h2>

      {Object.entries(grouped)
        .sort(([firstDate], [secondDate]) => secondDate.localeCompare(firstDate))
        .map(([date, dayEntries]) => (
          <div key={date}>
            <p className="mb-2 px-1 text-xs font-medium text-zinc-400 dark:text-zinc-500">
              {formatDateShort(date)}
            </p>

            <div className="space-y-2">
              {dayEntries.map((entry) => (
                <div
                  key={entry.id}
                  className={cn(
                    'group flex items-center gap-3 rounded-xl border bg-white p-3.5 transition-all dark:bg-zinc-900',
                    entry.type === 'income'
                      ? 'border-emerald-100 dark:border-emerald-900/40'
                      : 'border-zinc-100 dark:border-zinc-800'
                  )}
                >
                  <div
                    className={cn(
                      'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl text-base',
                      entry.type === 'income'
                        ? 'bg-emerald-50 dark:bg-emerald-950/40'
                        : 'bg-zinc-50 dark:bg-zinc-800'
                    )}
                  >
                    {categoryIcons[entry.category] ?? '💰'}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium leading-snug text-zinc-800 dark:text-zinc-100">
                      {entry.category}
                    </p>
                    {entry.description && (
                      <p className="mt-0.5 truncate text-xs text-zinc-400 dark:text-zinc-500">
                        {entry.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'text-sm font-semibold',
                        entry.type === 'income'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-zinc-800 dark:text-zinc-200'
                      )}
                    >
                      {entry.type === 'income' ? '+' : '-'}
                      {formatCurrency(entry.amount)}
                    </span>

                    <button
                      onClick={() => handleDelete(entry.id)}
                      disabled={deleting === entry.id}
                      className="p-1 text-zinc-300 opacity-0 transition-all hover:text-red-400 group-hover:opacity-100 disabled:opacity-30"
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
