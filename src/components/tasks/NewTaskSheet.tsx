'use client'

import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { createTask } from '@/lib/actions/tasks'
import type { Priority } from '@/types'

interface Props {
  areaId: string
  areaName: string
  areaColor: string
}

export function NewTaskSheet({ areaId, areaName, areaColor }: Props) {
  const [open, setOpen]       = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const fd = new FormData(e.currentTarget)
    const result = await createTask({
      title:       fd.get('title') as string,
      description: (fd.get('description') as string) || undefined,
      priority:    fd.get('priority') as Priority,
      due_date:    (fd.get('due_date') as string) || undefined,
      area_id:     areaId,
    })
    setLoading(false)
    if (result.error) { setError(result.error); return }
    setOpen(false)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-3 py-2 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm"
        style={{ backgroundColor: areaColor }}
      >
        <Plus size={14} strokeWidth={2.5} /> Nova tarefa
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative bg-white dark:bg-zinc-900 rounded-t-3xl p-5 pb-10 animate-in slide-in-from-bottom-4 duration-300 shadow-2xl">
            <div className="w-10 h-1 bg-zinc-200 dark:bg-zinc-700 rounded-full mx-auto mb-5" />

            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">Nova tarefa</h3>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">em {areaName}</p>
              </div>
              <button onClick={() => setOpen(false)} className="p-1.5 text-zinc-400 hover:text-zinc-600 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">Título *</label>
                <input
                  name="title"
                  required
                  autoFocus
                  placeholder="O que precisa ser feito?"
                  className="w-full px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 placeholder:text-zinc-300 dark:placeholder:text-zinc-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">Descrição</label>
                <textarea
                  name="description"
                  rows={2}
                  placeholder="Detalhes opcionais..."
                  className="w-full px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 placeholder:text-zinc-300 dark:placeholder:text-zinc-600 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">Prioridade</label>
                  <select
                    name="priority"
                    defaultValue="medium"
                    className="w-full px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    <option value="low">🟢 Baixa</option>
                    <option value="medium">🟡 Média</option>
                    <option value="high">🔴 Alta</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">Prazo</label>
                  <input
                    name="due_date"
                    type="date"
                    className="w-full px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              </div>

              {error && <p className="text-xs text-red-500 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded-lg">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
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
