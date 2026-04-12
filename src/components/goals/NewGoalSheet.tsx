'use client'

import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { createGoal } from '@/lib/actions/goals-areas'
import type { LifeArea, GoalTimeframe } from '@/types'

interface Props {
  areas: LifeArea[]
}

export function NewGoalSheet({ areas }: Props) {
  const [open, setOpen]       = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const fd = new FormData(e.currentTarget)
    const result = await createGoal({
      title:       fd.get('title') as string,
      timeframe:   fd.get('timeframe') as GoalTimeframe,
      area_id:     (fd.get('area_id') as string) || undefined,
      target_date: (fd.get('target_date') as string) || undefined,
    })
    setLoading(false)
    if (result.error) { setError(result.error); return }
    setOpen(false)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-3 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm shadow-violet-200 dark:shadow-violet-950"
      >
        <Plus size={14} strokeWidth={2.5} /> Nova meta
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative bg-white dark:bg-zinc-900 rounded-t-3xl p-5 pb-10 animate-in slide-in-from-bottom-4 duration-300 shadow-2xl">
            {/* Handle */}
            <div className="w-10 h-1 bg-zinc-200 dark:bg-zinc-700 rounded-full mx-auto mb-5" />

            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">Nova meta</h3>
              <button onClick={() => setOpen(false)} className="p-1.5 text-zinc-400 hover:text-zinc-600 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">Título da meta *</label>
                <input
                  name="title"
                  required
                  autoFocus
                  placeholder="Ex: Ler 12 livros este ano"
                  className="w-full px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 placeholder:text-zinc-300 dark:placeholder:text-zinc-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">Prazo</label>
                  <select
                    name="timeframe"
                    defaultValue="short"
                    className="w-full px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    <option value="short">Curto (até 3m)</option>
                    <option value="medium">Médio (3–12m)</option>
                    <option value="long">Longo (+1 ano)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">Data alvo</label>
                  <input
                    name="target_date"
                    type="date"
                    className="w-full px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">Área da vida</label>
                <select
                  name="area_id"
                  className="w-full px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  <option value="">Sem área específica</option>
                  {areas.map(a => (
                    <option key={a.id} value={a.id}>{a.icon} {a.name}</option>
                  ))}
                </select>
              </div>

              {error && <p className="text-xs text-red-500 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded-lg">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
              >
                {loading ? 'Salvando...' : 'Criar meta'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
