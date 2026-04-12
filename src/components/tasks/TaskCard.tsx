'use client'

import { useState } from 'react'
import { Check, Clock, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { updateTaskStatus, deleteTask } from '@/lib/actions/tasks'
import type { Task } from '@/types'

const priorityConfig = {
  high:   { label: 'Alta',   color: 'text-red-500',    dot: 'bg-red-500'    },
  medium: { label: 'Média',  color: 'text-amber-500',  dot: 'bg-amber-500'  },
  low:    { label: 'Baixa',  color: 'text-zinc-400',   dot: 'bg-zinc-400'   },
}

interface TaskCardProps {
  task: Task
  compact?: boolean
}

export function TaskCard({ task, compact = false }: TaskCardProps) {
  const [loading, setLoading] = useState(false)
  const isDone = task.status === 'done'
  const p = priorityConfig[task.priority]

  async function handleToggle() {
    setLoading(true)
    await updateTaskStatus(task.id, isDone ? 'pending' : 'done')
    setLoading(false)
  }

  async function handleDelete() {
    if (!confirm('Remover esta tarefa?')) return
    await deleteTask(task.id)
  }

  const completedSubtasks = task.subtasks?.filter(s => s.completed).length ?? 0
  const totalSubtasks = task.subtasks?.length ?? 0

  return (
    <div className={cn(
      'group flex items-start gap-3 p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 transition-all duration-200',
      isDone && 'opacity-60',
      !compact && 'hover:border-zinc-200 dark:hover:border-zinc-700 hover:shadow-sm'
    )}>
      {/* Checkbox */}
      <button
        onClick={handleToggle}
        disabled={loading}
        className={cn(
          'mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200',
          isDone
            ? 'bg-violet-600 border-violet-600'
            : 'border-zinc-300 dark:border-zinc-600 hover:border-violet-400'
        )}
      >
        {isDone && <Check size={11} className="text-white" strokeWidth={3} />}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={cn(
          'text-sm font-medium text-zinc-800 dark:text-zinc-100 leading-snug',
          isDone && 'line-through text-zinc-400 dark:text-zinc-500'
        )}>
          {task.title}
        </p>

        {!compact && task.description && (
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5 line-clamp-1">
            {task.description}
          </p>
        )}

        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          {/* Priority dot */}
          <span className="flex items-center gap-1">
            <span className={cn('w-1.5 h-1.5 rounded-full', p.dot)} />
            <span className={cn('text-[10px] font-medium', p.color)}>{p.label}</span>
          </span>

          {/* Due date */}
          {task.due_date && (
            <span className="flex items-center gap-1 text-[10px] text-zinc-400 dark:text-zinc-500">
              <Clock size={10} />
              {new Date(task.due_date + 'T00:00:00').toLocaleDateString('pt-BR', {
                day: '2-digit', month: 'short'
              })}
            </span>
          )}

          {/* Area badge */}
          {task.area && (
            <span
              className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
              style={{
                backgroundColor: task.area.color + '20',
                color: task.area.color,
              }}
            >
              {task.area.icon} {task.area.name}
            </span>
          )}

          {/* Subtasks progress */}
          {totalSubtasks > 0 && (
            <span className="text-[10px] text-zinc-400">
              {completedSubtasks}/{totalSubtasks} subtarefas
            </span>
          )}
        </div>
      </div>

      {/* Delete */}
      <button
        onClick={handleDelete}
        className="opacity-0 group-hover:opacity-100 p-1 text-zinc-300 hover:text-red-400 transition-all"
      >
        <Trash2 size={14} />
      </button>
    </div>
  )
}
