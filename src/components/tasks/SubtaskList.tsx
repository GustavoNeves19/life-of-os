'use client'

import { useState, useTransition } from 'react'
import { Check, Plus, Trash2 } from 'lucide-react'
import { createSubtask, deleteSubtask, toggleSubtask } from '@/lib/actions/tasks'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import type { Subtask } from '@/types'

interface Props {
  taskId: string
  subtasks: Subtask[]
}

export function SubtaskList({ taskId, subtasks: initial }: Props) {
  const [subtasks, setSubtasks] = useState(initial)
  const [newTitle, setNewTitle] = useState('')
  const [adding, setAdding] = useState(false)
  const [showInput, setShowInput] = useState(false)
  const [, startTransition] = useTransition()
  const router = useRouter()

  function handleToggle(id: string, completed: boolean) {
    setSubtasks((prev) => prev.map((subtask) => (
      subtask.id === id ? { ...subtask, completed } : subtask
    )))

    startTransition(async () => {
      await toggleSubtask(id, completed)
    })
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!newTitle.trim()) return

    setAdding(true)
    const { data, error } = await createSubtask(taskId, newTitle)

    if (!error && data) {
      setSubtasks((prev) => [...prev, data])
      setNewTitle('')
      setShowInput(false)
    }

    setAdding(false)
    router.refresh()
  }

  async function handleDelete(id: string) {
    setSubtasks((prev) => prev.filter((subtask) => subtask.id !== id))
    await deleteSubtask(id)
    router.refresh()
  }

  return (
    <div className="space-y-2">
      {subtasks.length === 0 && !showInput && (
        <p className="py-2 text-xs text-zinc-300 dark:text-zinc-600">
          Nenhuma subtarefa ainda.
        </p>
      )}

      {subtasks.map((subtask) => (
        <div key={subtask.id} className="group flex items-center gap-2.5">
          <button
            onClick={() => handleToggle(subtask.id, !subtask.completed)}
            className={cn(
              'flex-shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center transition-all',
              subtask.completed
                ? 'border-violet-600 bg-violet-600'
                : 'border-zinc-300 hover:border-violet-400 dark:border-zinc-600'
            )}
          >
            {subtask.completed && <Check size={9} className="text-white" strokeWidth={3} />}
          </button>

          <span
            className={cn(
              'flex-1 text-sm text-zinc-700 dark:text-zinc-300',
              subtask.completed && 'line-through text-zinc-400 dark:text-zinc-500'
            )}
          >
            {subtask.title}
          </span>

          <button
            onClick={() => handleDelete(subtask.id)}
            className="p-1 text-zinc-300 opacity-0 transition-all group-hover:opacity-100 hover:text-red-400"
          >
            <Trash2 size={12} />
          </button>
        </div>
      ))}

      {showInput ? (
        <form onSubmit={handleAdd} className="flex items-center gap-2 pt-1">
          <input
            autoFocus
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Nome da subtarefa..."
            className="flex-1 rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 text-sm placeholder:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-violet-500 dark:border-zinc-700 dark:bg-zinc-800 dark:placeholder:text-zinc-600"
          />

          <button
            type="submit"
            disabled={adding || !newTitle.trim()}
            className="rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-violet-700 disabled:opacity-40"
          >
            {adding ? '...' : 'Add'}
          </button>

          <button
            type="button"
            onClick={() => {
              setShowInput(false)
              setNewTitle('')
            }}
            className="px-2 py-1.5 text-xs text-zinc-400 transition-colors hover:text-zinc-600"
          >
            Cancelar
          </button>
        </form>
      ) : (
        <button
          onClick={() => setShowInput(true)}
          className="flex items-center gap-1.5 pt-1 text-xs font-medium text-zinc-400 transition-colors hover:text-violet-600 dark:hover:text-violet-400"
        >
          <Plus size={13} /> Adicionar subtarefa
        </button>
      )}
    </div>
  )
}
