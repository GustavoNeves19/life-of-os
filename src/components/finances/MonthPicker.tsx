'use client'

import { useRouter, usePathname } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { currentMonth } from '@/lib/utils'

interface Props {
  current: string
}

export function MonthPicker({ current }: Props) {
  const router = useRouter()
  const pathname = usePathname()

  function navigate(delta: number) {
    const [year, month] = current.split('-').map(Number)
    const d = new Date(year, month - 1 + delta, 1)
    const next = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    router.push(`${pathname}?month=${next}`)
  }

  const isCurrentMonth = current === currentMonth()

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => navigate(-1)}
        className="w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 transition-colors"
      >
        <ChevronLeft size={16} />
      </button>
      <button
        onClick={() => navigate(1)}
        disabled={isCurrentMonth}
        className="w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  )
}
