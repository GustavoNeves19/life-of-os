'use client'

import { useState, useTransition } from 'react'
import { updateGoalProgress } from '@/lib/actions/goals-areas'
import { formatDateShort } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { Clock } from 'lucide-react'
import type { Goal } from '@/types'

interface Props {
  goal: Goal
}

const timeframeColor: Record<string, string> = {
  short:  'text-amber-500  bg-amber-50  dark:bg-amber-950/30',
  medium: 'text-blue-500   bg-blue-50   dark:bg-blue-950/30',
  long:   'text-violet-500 bg-violet-50 dark:bg-violet-950/30',
}

const timeframeLabel: Record<string, string> = {
  short: 'Curto prazo', medium: 'Médio prazo', long: 'Longo prazo'
}

export function GoalCard({ goal }: Props) {
  const [progress, setProgress] = useState(goal.progress)
  const [pending, startTransition] = useTransition()
  const isDone = goal.status === 'done' || progress >= 100

  function handleProgressChange(value: number) {
    setProgress(value)
    startTransition(async () => {
      await updateGoalProgress(goal.id, value)
    })
  }

  return (
    <div className={cn(
      'bg-white dark:bg-zinc-900 rounded-xl border p-4 transition-all',
      isDone
        ? 'border-emerald-100 dark:border-emerald-900/30'
        : 'border-zinc-100 dark:border-zinc-800'
    )}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <p className={cn(
            'text-sm font-medium text-zinc-800 dark:text-zinc-100 leading-snug',
            isDone && 'line-through text-zinc-400 dark:text-zinc-500'
          )}>
            {goal.title}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className={cn(
              'text-[10px] font-medium px-1.5 py-0.5 rounded-full',
              timeframeColor[goal.timeframe]
            )}>
              {timeframeLabel[goal.timeframe]}
            </span>
            {goal.area && (
              <span
                className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                style={{
                  backgroundColor: goal.area.color + '20',
                  color: goal.area.color,
                }}
              >
                {goal.area.icon} {goal.area.name}
              </span>
            )}
            {goal.target_date && (
              <span className="flex items-center gap-1 text-[10px] text-zinc-400 dark:text-zinc-500">
                <Clock size={9} />
                {formatDateShort(goal.target_date)}
              </span>
            )}
          </div>
        </div>
        <span className={cn(
          'text-sm font-bold flex-shrink-0',
          isDone ? 'text-emerald-500' : 'text-zinc-700 dark:text-zinc-300'
        )}>
          {isDone ? '✓' : `${progress}%`}
        </span>
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500',
              isDone ? 'bg-emerald-500' : 'bg-violet-500'
            )}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Editable slider */}
        {!isDone && (
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={progress}
            disabled={pending}
            onChange={e => handleProgressChange(Number(e.target.value))}
            className="w-full h-1.5 accent-violet-600 cursor-pointer disabled:opacity-50"
            aria-label={`Progresso: ${progress}%`}
          />
        )}
      </div>
    </div>
  )
}
