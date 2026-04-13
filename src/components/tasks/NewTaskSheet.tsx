'use client'

import { useEffect, useRef, useState } from 'react'
import { Plus, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createTask } from '@/lib/actions/tasks'
import { SuccessToast } from '@/components/shared/SuccessToast'
import type { LifeArea, Priority, TaskStatus } from '@/types'

interface Props {
  areas: LifeArea[]
  defaultAreaId?: string
  areaName?: string
  areaColor: string
}

export function NewTaskSheet({ areas, defaultAreaId, areaName, areaColor }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const fd = new FormData(e.currentTarget)
    const result = await createTask({
      title: fd.get('title') as string,
      description: (fd.get('description') as string) || undefined,
      priority: fd.get('priority') as Priority,
      status: fd.get('status') as TaskStatus,
      due_date: (fd.get('due_date') as string) || undefined,
      area_id: (fd.get('area_id') as string) || undefined,
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

  return (
    <>
      {successMessage && <SuccessToast message={successMessage} />}

      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold text-white transition-colors shadow-sm"
        style={{ backgroundColor: areaColor }}
      >
        <Plus size={14} strokeWidth={2.5} /> Nova tarefa
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="animate-in slide-in-from-bottom-4 relative rounded-t-3xl bg-white p-5 pb-10 shadow-2xl duration-300 dark:bg-zinc-900">
            <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-zinc-200 dark:bg-zinc-700" />

            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
                  Nova tarefa
                </h3>
                {areaName && (
                  <p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">
                    sugestao inicial em {areaName}
                  </p>
                )}
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  Titulo *
                </label>
                <input
                  name="title"
                  required
                  autoFocus
                  placeholder="O que precisa ser feito?"
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm placeholder:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-violet-500 dark:border-zinc-700 dark:bg-zinc-800 dark:placeholder:text-zinc-600"
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
                  className="w-full resize-none rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm placeholder:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-violet-500 dark:border-zinc-700 dark:bg-zinc-800 dark:placeholder:text-zinc-600"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  Area da vida
                </label>
                <select
                  name="area_id"
                  defaultValue={defaultAreaId ?? ''}
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
                className="w-full rounded-xl py-3 text-sm font-semibold text-white transition-colors disabled:opacity-50"
                style={{ backgroundColor: areaColor }}
              >
                {loading ? 'Salvando...' : 'Criar tarefa'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
