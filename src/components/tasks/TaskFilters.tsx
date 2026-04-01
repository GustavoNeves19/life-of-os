'use client'

import { useRouter, usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import type { LifeArea, TaskStatus, Priority } from '@/types'

interface Props {
  areas: LifeArea[]
  current: { status?: TaskStatus; area_id?: string; priority?: Priority }
}

export function TaskFilters({ areas, current }: Props) {
  const router = useRouter()
  const pathname = usePathname()

  function update(key: string, value: string | undefined) {
    const params = new URLSearchParams()
    if (current.status && key !== 'status') params.set('status', current.status)
    if (current.area_id && key !== 'area_id') params.set('area_id', current.area_id)
    if (current.priority && key !== 'priority') params.set('priority', current.priority)
    if (value) params.set(key, value)
    router.push(`${pathname}?${params.toString()}`)
  }

  const statusOptions: { value: TaskStatus | ''; label: string }[] = [
    { value: '', label: 'Todas' },
    { value: 'pending', label: 'Pendentes' },
    { value: 'in_progress', label: 'Em andamento' },
    { value: 'done', label: 'Concluídas' },
  ]

  return (
    <div className="space-y-2">
      {/* Status filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {statusOptions.map(opt => (
          <button
            key={opt.value}
            onClick={() => update('status', opt.value || undefined)}
            className={cn(
              'flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all',
              (current.status ?? '') === opt.value
                ? 'bg-violet-600 text-white'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Area filter */}
      {areas.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => update('area_id', undefined)}
            className={cn(
              'flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all',
              !current.area_id
                ? 'bg-zinc-800 dark:bg-zinc-100 text-white dark:text-zinc-900'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            )}
          >
            Todas as áreas
          </button>
          {areas.map(area => (
            <button
              key={area.id}
              onClick={() => update('area_id', area.id)}
              className={cn(
                'flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all',
                current.area_id === area.id
                  ? 'text-white'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              )}
              style={current.area_id === area.id ? { backgroundColor: area.color } : {}}
            >
              <span>{area.icon}</span>
              {area.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
