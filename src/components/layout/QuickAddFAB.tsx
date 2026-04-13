'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X, CheckSquare, DollarSign } from 'lucide-react'
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
} from '@/lib/constants/finance'
import { SuccessToast } from '@/components/shared/SuccessToast'
import { cn, localDateString } from '@/lib/utils'
import { createTask } from '@/lib/actions/tasks'
import { createFinancialEntry } from '@/lib/actions/finances'
import type { FinanceType, LifeArea, Priority, TaskStatus } from '@/types'

type Mode = 'task' | 'finance'

interface Props {
  areas: LifeArea[]
}

export function QuickAddFAB({ areas }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<Mode>('task')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [financeType, setFinanceType] = useState<FinanceType>('expense')
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const financeCategories = useMemo(
    () => (financeType === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES),
    [financeType]
  )

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  function showSuccess(message: string) {
    setSuccessMessage(message)

    if (timeoutRef.current) clearTimeout(timeoutRef.current)

    timeoutRef.current = setTimeout(() => {
      setSuccessMessage('')
      timeoutRef.current = null
    }, 2500)
  }

  async function handleTaskSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const result = await createTask({
      title: formData.get('title') as string,
      description: (formData.get('description') as string) || undefined,
      priority: formData.get('priority') as Priority,
      status: formData.get('status') as TaskStatus,
      area_id: (formData.get('area_id') as string) || undefined,
      due_date: (formData.get('due_date') as string) || undefined,
    })

    setLoading(false)

    if (result.error) {
      setError(result.error)
      return
    }

    e.currentTarget.reset()
    setOpen(false)
    showSuccess('Tarefa cadastrada com sucesso.')
    router.refresh()
  }

  async function handleFinanceSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const result = await createFinancialEntry({
      type: financeType,
      amount: parseFloat(formData.get('amount') as string),
      category: formData.get('category') as string,
      description: (formData.get('description') as string) || undefined,
      date: localDateString(),
    })

    setLoading(false)

    if (result.error) {
      setError(result.error)
      return
    }

    e.currentTarget.reset()
    setFinanceType('expense')
    setOpen(false)
    showSuccess('Lancamento registrado com sucesso.')
    router.refresh()
  }

  function close() {
    setOpen(false)
    setError('')
    setLoading(false)
    setFinanceType('expense')
  }

  return (
    <>
      {successMessage && <SuccessToast message={successMessage} />}

      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={close}
        />
      )}

      {open && (
        <div className="animate-in slide-in-from-bottom-4 fixed bottom-20 left-4 right-4 z-50 mx-auto max-w-lg overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-2xl duration-300 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex border-b border-zinc-100 dark:border-zinc-800">
            <button
              onClick={() => {
                setMode('task')
                setError('')
              }}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors',
                mode === 'task'
                  ? 'border-b-2 border-violet-600 text-violet-600'
                  : 'text-zinc-400 hover:text-zinc-600'
              )}
            >
              <CheckSquare size={15} />
              Tarefa
            </button>

            <button
              onClick={() => {
                setMode('finance')
                setError('')
              }}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors',
                mode === 'finance'
                  ? 'border-b-2 border-emerald-600 text-emerald-600'
                  : 'text-zinc-400 hover:text-zinc-600'
              )}
            >
              <DollarSign size={15} />
              Lancamento
            </button>
          </div>

          <div className="p-4">
            {mode === 'task' ? (
              <form onSubmit={handleTaskSubmit} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    Titulo *
                  </label>
                  <input
                    name="title"
                    placeholder="O que voce precisa fazer?"
                    required
                    autoFocus
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500 dark:border-zinc-700 dark:bg-zinc-800"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    Descricao
                  </label>
                  <textarea
                    name="description"
                    rows={2}
                    placeholder="Detalhes opcionais..."
                    className="w-full resize-none rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500 dark:border-zinc-700 dark:bg-zinc-800"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    Area da vida
                  </label>
                  <select
                    name="area_id"
                    defaultValue=""
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 dark:border-zinc-700 dark:bg-zinc-800"
                  >
                    <option value="">Sem area especifica</option>
                    {areas.map((area) => (
                      <option key={area.id} value={area.id}>
                        {area.icon} {area.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
                      Prioridade
                    </label>
                    <select
                      name="priority"
                      defaultValue="medium"
                      className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 dark:border-zinc-700 dark:bg-zinc-800"
                    >
                      <option value="low">Baixa</option>
                      <option value="medium">Media</option>
                      <option value="high">Alta</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
                      Status
                    </label>
                    <select
                      name="status"
                      defaultValue="pending"
                      className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 dark:border-zinc-700 dark:bg-zinc-800"
                    >
                      <option value="pending">Pendente</option>
                      <option value="in_progress">Em andamento</option>
                      <option value="done">Concluida</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    Prazo
                  </label>
                  <input
                    name="due_date"
                    type="date"
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 dark:border-zinc-700 dark:bg-zinc-800"
                  />
                </div>

                {error && (
                  <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-500 dark:bg-red-950/30">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-violet-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-violet-700 disabled:opacity-50"
                >
                  {loading ? 'Salvando...' : 'Criar tarefa'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleFinanceSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFinanceType('expense')}
                    className={cn(
                      'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      financeType === 'expense'
                        ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                        : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400'
                    )}
                  >
                    Despesa
                  </button>

                  <button
                    type="button"
                    onClick={() => setFinanceType('income')}
                    className={cn(
                      'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      financeType === 'income'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400'
                    )}
                  >
                    Receita
                  </button>
                </div>

                <div className="flex gap-2">
                  <input
                    name="amount"
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    required
                    className="flex-1 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-800"
                  />

                  <select
                    name="category"
                    key={financeType}
                    defaultValue={financeCategories[0]}
                    className="flex-1 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-800"
                  >
                    {financeCategories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <input
                  name="description"
                  placeholder="Descricao (opcional)"
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-800"
                />

                {error && (
                  <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-500 dark:bg-red-950/30">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg bg-emerald-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
                >
                  {loading ? 'Salvando...' : 'Registrar'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      <button
        onClick={() => {
          if (open) {
            close()
            return
          }

          setOpen(true)
          setMode('task')
          setError('')
        }}
        className={cn(
          'fixed bottom-20 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all duration-300',
          open
            ? 'scale-90 rotate-45 bg-zinc-700'
            : 'bg-violet-600 hover:scale-110 hover:bg-violet-700 active:scale-95'
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
