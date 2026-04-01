'use client'

import { useState } from 'react'
import { Plus, X, CheckSquare, DollarSign } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createTask } from '@/lib/actions/tasks'
import { createFinancialEntry } from '@/lib/actions/finances'

type Mode = 'task' | 'finance'

export function QuickAddFAB() {
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<Mode>('task')
  const [loading, setLoading] = useState(false)

  async function handleTaskSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const fd = new FormData(e.currentTarget)
    await createTask({
      title: fd.get('title') as string,
      priority: (fd.get('priority') as any) ?? 'medium',
      due_date: (fd.get('due_date') as string) || undefined,
    })
    setLoading(false)
    setOpen(false)
  }

  async function handleFinanceSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const fd = new FormData(e.currentTarget)
    await createFinancialEntry({
      type: fd.get('type') as any,
      amount: parseFloat(fd.get('amount') as string),
      category: fd.get('category') as string,
      description: (fd.get('description') as string) || undefined,
      date: new Date().toISOString().split('T')[0],
    })
    setLoading(false)
    setOpen(false)
  }

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Modal */}
      {open && (
        <div className="fixed bottom-20 left-4 right-4 z-50 max-w-lg mx-auto bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-100 dark:border-zinc-800 overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          {/* Tab selector */}
          <div className="flex border-b border-zinc-100 dark:border-zinc-800">
            <button
              onClick={() => setMode('task')}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors',
                mode === 'task'
                  ? 'text-violet-600 border-b-2 border-violet-600'
                  : 'text-zinc-400 hover:text-zinc-600'
              )}
            >
              <CheckSquare size={15} />
              Tarefa
            </button>
            <button
              onClick={() => setMode('finance')}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors',
                mode === 'finance'
                  ? 'text-emerald-600 border-b-2 border-emerald-600'
                  : 'text-zinc-400 hover:text-zinc-600'
              )}
            >
              <DollarSign size={15} />
              Lançamento
            </button>
          </div>

          <div className="p-4">
            {mode === 'task' ? (
              <form onSubmit={handleTaskSubmit} className="space-y-3">
                <input
                  name="title"
                  placeholder="O que você precisa fazer?"
                  required
                  autoFocus
                  className="w-full px-3 py-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 placeholder:text-zinc-400"
                />
                <div className="flex gap-2">
                  <select
                    name="priority"
                    className="flex-1 px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    <option value="low">Baixa prioridade</option>
                    <option value="medium" selected>Média prioridade</option>
                    <option value="high">Alta prioridade</option>
                  </select>
                  <input
                    name="due_date"
                    type="date"
                    className="flex-1 px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {loading ? 'Salvando...' : 'Criar tarefa'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleFinanceSubmit} className="space-y-3">
                <div className="flex gap-2">
                  <select
                    name="type"
                    className="flex-1 px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="expense">Despesa</option>
                    <option value="income">Receita</option>
                  </select>
                  <input
                    name="amount"
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    required
                    className="flex-1 px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-zinc-400"
                  />
                </div>
                <input
                  name="category"
                  placeholder="Categoria (ex: Alimentação)"
                  required
                  className="w-full px-3 py-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-zinc-400"
                />
                <input
                  name="description"
                  placeholder="Descrição (opcional)"
                  className="w-full px-3 py-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-zinc-400"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {loading ? 'Salvando...' : 'Registrar'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* FAB Button */}
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'fixed bottom-20 right-4 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300',
          open
            ? 'bg-zinc-700 rotate-45 scale-90'
            : 'bg-violet-600 hover:bg-violet-700 hover:scale-110 active:scale-95'
        )}
      >
        {open ? (
          <X size={22} className="text-white" />
        ) : (
          <Plus size={26} className="text-white" strokeWidth={2.5} />
        )}
      </button>
    </>
  )
}
