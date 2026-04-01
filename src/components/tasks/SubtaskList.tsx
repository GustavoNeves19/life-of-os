'use client'

import { useState, useTransition } from 'react'
import { Check, Plus, Trash2 } from 'lucide-react'
import { toggleSubtask } from '@/lib/actions/tasks'
import { createClient } from '@/lib/supabase/client'
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
  const [adding, setAdding]     = useState(false)
  const [showInput, setShowInput] = useState(false)
  const [pending, startTransition] = useTransition()
  const router  = useRouter()
  const supabase = createClient()

  function handleToggle(id: string, completed: boolean) {
    setSubtasks(prev => prev.map(s => s.id === id ? { ...s, completed } : s))
    startTransition(async () => {
      await toggleSubtask(id, completed)
    })
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!newTitle.trim()) return
    setAdding(true)
    const { data, error } = await supabase
      .from('subtasks')
      .insert({ task_id: taskId, title: newTitle.trim(), completed: false })
      .select()
      .single()

    if (!error && data) {
      setSubtasks(prev => [...prev, data as Subtask])
      setNewTitle('')
      setShowInput(false)
    }
    setAdding(false)
    router.refresh()
  }

  async function handleDelete(id: string) {
    setSubtasks(prev => prev.filter(s => s.id !== id))
    await supabase.from('subtasks').delete().eq('id', id)
    router.refresh()
  }

  return (
    <div className="space-y-2">
      {subtasks.length === 0 && !showInput && (
        <p className="text-xs text-zinc-300 dark:text-zinc-600 py-2">Nenhuma subtarefa ainda.</p>
      )}

      {subtasks.map(sub => (
        <div key={sub.id} className="group flex items-center gap-2.5">
          <button
            onClick={() => handleToggle(sub.id, !sub.completed)}
            className={cn(
              'w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all',
              sub.completed
                ? 'bg-violet-600 border-violet-600'
                : 'border-zinc-300 dark:border-zinc-600 hover:border-violet-400'
            )}
          >
            {sub.completed && <Check size={9} className="text-white" strokeWidth={3} />}
          </button>
          <span className={cn(
            'flex-1 text-sm text-zinc-700 dark:text-zinc-300',
            sub.completed && 'line-through text-zinc-400 dark:text-zinc-500'
          )}>
            {sub.title}
          </span>
          <button
            onClick={() => handleDelete(sub.id)}
            className="opacity-0 group-hover:opacity-100 p-1 text-zinc-300 hover:text-red-400 transition-all"
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
            onChange={e => setNewTitle(e.target.value)}
            placeholder="Nome da subtarefa..."
            className="flex-1 px-2.5 py-1.5 text-sm rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-violet-500 placeholder:text-zinc-300 dark:placeholder:text-zinc-600"
          />
          <button
            type="submit"
            disabled={adding || !newTitle.trim()}
            className="px-3 py-1.5 bg-violet-600 text-white text-xs rounded-lg font-medium disabled:opacity-40 transition-colors hover:bg-violet-700"
          >
            {adding ? '...' : 'Add'}
          </button>
          <button
            type="button"
            onClick={() => { setShowInput(false); setNewTitle('') }}
            className="px-2 py-1.5 text-zinc-400 text-xs hover:text-zinc-600 transition-colors"
          >
            Cancel
          </button>
        </form>
      ) : (
        <button
          onClick={() => setShowInput(true)}
          className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors pt-1 font-medium"
        >
          <Plus size={13} /> Adicionar subtarefa
        </button>
      )}
    </div>
  )
}
