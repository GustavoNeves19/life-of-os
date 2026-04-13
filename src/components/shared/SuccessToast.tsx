'use client'

import { CheckCircle2 } from 'lucide-react'

interface Props {
  message: string
}

export function SuccessToast({ message }: Props) {
  return (
    <div className="animate-in slide-in-from-bottom-4 fixed bottom-28 left-4 right-4 z-[60] mx-auto max-w-md rounded-2xl border border-emerald-200 bg-white/95 px-4 py-3 shadow-lg backdrop-blur dark:border-emerald-900 dark:bg-zinc-900/95">
      <div className="flex items-center gap-3">
        <CheckCircle2 size={18} className="flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
        <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100">{message}</p>
      </div>
    </div>
  )
}
