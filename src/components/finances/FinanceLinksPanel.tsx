'use client'

import { useState } from 'react'
import { ExternalLink, Trash2 } from 'lucide-react'
import { deleteFinanceLink } from '@/lib/actions/finances'
import { FINANCE_LINK_KIND_META } from '@/lib/constants/finance'
import { NewFinanceLinkSheet } from '@/components/finances/NewFinanceLinkSheet'
import { cn } from '@/lib/utils'
import type { FinanceLink, FinanceLinkKind } from '@/types'

interface Props {
  links: FinanceLink[]
}

const kindColors: Record<FinanceLinkKind, string> = {
  spreadsheet: 'bg-violet-50 text-violet-700 dark:bg-violet-950/30 dark:text-violet-300',
  banking: 'bg-sky-50 text-sky-700 dark:bg-sky-950/30 dark:text-sky-300',
  card: 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300',
  investments: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300',
  bills: 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300',
  documents: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
  other: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
}

function hostnameLabel(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

export function FinanceLinksPanel({ links }: Props) {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleDelete(id: string) {
    if (!confirm('Remover este acesso rapido?')) return

    setDeletingId(id)
    await deleteFinanceLink(id)
    setDeletingId(null)
  }

  return (
    <section className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
            Central financeira
          </h2>
          <p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">
            Seus links importantes em um toque
          </p>
        </div>

        <NewFinanceLinkSheet />
      </div>

      {links.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
            Nenhum acesso salvo ainda
          </p>
          <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
            Adicione sua planilha, banco, cartao ou relatorios para abrir direto daqui.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {links.map((link) => {
            const meta = FINANCE_LINK_KIND_META[link.kind] ?? FINANCE_LINK_KIND_META.other

            return (
              <div
                key={link.id}
                className="rounded-2xl border border-zinc-100 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold',
                          kindColors[link.kind]
                        )}
                      >
                        <span>{meta.icon}</span>
                        {meta.label}
                      </span>

                      {link.provider && (
                        <span className="truncate text-[11px] text-zinc-400 dark:text-zinc-500">
                          {link.provider}
                        </span>
                      )}
                    </div>

                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      {link.title}
                    </p>

                    <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
                      {hostnameLabel(link.url)}
                    </p>

                    {link.notes && (
                      <p className="mt-2 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                        {link.notes}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => handleDelete(link.id)}
                    disabled={deletingId === link.id}
                    className="rounded-lg p-2 text-zinc-300 transition-colors hover:bg-red-50 hover:text-red-500 disabled:opacity-40 dark:hover:bg-red-950/30"
                    aria-label={`Remover acesso ${link.title}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="mt-4">
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-900 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                  >
                    Abrir link <ExternalLink size={13} />
                  </a>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
