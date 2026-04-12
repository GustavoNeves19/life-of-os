'use client'

import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { createFinanceLink } from '@/lib/actions/finances'
import { FINANCE_LINK_KIND_OPTIONS } from '@/lib/constants/finance'
import type { FinanceLinkKind } from '@/types'

export function NewFinanceLinkSheet() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const result = await createFinanceLink({
      title: formData.get('title') as string,
      url: formData.get('url') as string,
      provider: (formData.get('provider') as string) || undefined,
      kind: formData.get('kind') as FinanceLinkKind,
      notes: (formData.get('notes') as string) || undefined,
    })

    setLoading(false)

    if (result.error) {
      setError(result.error)
      return
    }

    e.currentTarget.reset()
    setOpen(false)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-xl bg-zinc-900 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        <Plus size={14} strokeWidth={2.5} /> Novo acesso
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
                  Novo acesso financeiro
                </h3>
                <p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">
                  Salve planilha, banco, cartao ou qualquer link importante
                </p>
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
                  placeholder="Ex: Planilha mensal"
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm placeholder:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-violet-500 dark:border-zinc-700 dark:bg-zinc-800 dark:placeholder:text-zinc-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    Tipo
                  </label>
                  <select
                    name="kind"
                    defaultValue="spreadsheet"
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 dark:border-zinc-700 dark:bg-zinc-800"
                  >
                    {FINANCE_LINK_KIND_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.icon} {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    Provedor
                  </label>
                  <input
                    name="provider"
                    placeholder="Ex: Google Sheets"
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm placeholder:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-violet-500 dark:border-zinc-700 dark:bg-zinc-800 dark:placeholder:text-zinc-600"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  URL *
                </label>
                <input
                  name="url"
                  type="url"
                  required
                  placeholder="https://..."
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm placeholder:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-violet-500 dark:border-zinc-700 dark:bg-zinc-800 dark:placeholder:text-zinc-600"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  Observacao
                </label>
                <textarea
                  name="notes"
                  rows={2}
                  placeholder="Ex: usar para fechar o mes"
                  className="w-full resize-none rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm placeholder:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-violet-500 dark:border-zinc-700 dark:bg-zinc-800 dark:placeholder:text-zinc-600"
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
                {loading ? 'Salvando...' : 'Salvar acesso'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
