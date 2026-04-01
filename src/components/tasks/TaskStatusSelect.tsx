'use client'

import { useState, useTransition } from 'react'
import { updateTaskStatus } from '@/lib/actions/tasks'
import { cn } from '@/lib/utils'
import type { TaskStatus } from '@/types'

const options: { value: TaskStatus; label: string; color: string }[] = [
  { value: 'pending',     label: 'Pendente',      color: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400' },
  { value: 'in_progress', label: 'Em andamento',  color: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400' },
  { value: 'done',        label: 'Concluída',     color: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400' },
]

interface Props {
  taskId: string
  current: TaskStatus
}

export function TaskStatusSelect({ taskId, current }: Props) {
  const [status, setStatus] = useState(current)
  const [open, setOpen]     = useState(false)
  const [, startTransition] = useTransition()

  const currentOption = options.find(o => o.value === status)!

  function select(value: TaskStatus) {
    setStatus(value)
    setOpen(false)
    startTransition(async () => {
      await updateTaskStatus(taskId, value)
    })
  }

  return (
    <div className="relative flex-shrink-0">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'px-3 py-1.5 rounded-xl text-xs font-semibold transition-all',
          currentOption.color
        )}
      >
        {currentOption.label}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-20 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl shadow-lg overflow-hidden min-w-[160px]">
            {options.map(opt => (
              <button
                key={opt.value}
                onClick={() => select(opt.value)}
                className={cn(
                  'w-full text-left px-4 py-2.5 text-xs font-medium transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800',
                  status === opt.value ? opt.color : 'text-zinc-600 dark:text-zinc-400'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
