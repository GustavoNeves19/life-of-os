import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { ArrowLeft, Calendar, Flag, Circle } from 'lucide-react'
import Link from 'next/link'
import { SubtaskList } from '@/components/tasks/SubtaskList'
import { TaskStatusSelect } from '@/components/tasks/TaskStatusSelect'
import { formatDate, isOverdue } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface Props {
  params: Promise<{ id: string }>
}

const priorityConfig = {
  high:   { label: 'Alta',   color: 'text-red-500',   bg: 'bg-red-50 dark:bg-red-950/30'    },
  medium: { label: 'Média',  color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/30' },
  low:    { label: 'Baixa',  color: 'text-zinc-400',  bg: 'bg-zinc-50 dark:bg-zinc-800'      },
}

export default async function TaskDetailPage({ params }: Props) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { id } = await params

  const { data: task, error } = await supabase
    .from('tasks')
    .select('*, area:life_areas(id, name, color, icon), subtasks(*)')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !task) notFound()

  const p = priorityConfig[task.priority as keyof typeof priorityConfig]
  const overdue = isOverdue(task.due_date) && task.status !== 'done'
  const completedSubtasks = task.subtasks?.filter((s: any) => s.completed).length ?? 0
  const totalSubtasks = task.subtasks?.length ?? 0

  return (
    <div className="space-y-5 pb-4">
      {/* Back nav */}
      <div className="pt-2">
        <Link href="/tasks" className="inline-flex items-center gap-1.5 text-xs text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 mb-4 transition-colors">
          <ArrowLeft size={13} /> Tarefas
        </Link>

        <div className="flex items-start justify-between gap-3">
          <h1 className={cn(
            'text-xl font-bold text-zinc-900 dark:text-zinc-50 leading-snug flex-1',
            task.status === 'done' && 'line-through text-zinc-400 dark:text-zinc-500'
          )}>
            {task.title}
          </h1>
          <TaskStatusSelect taskId={task.id} current={task.status} />
        </div>
      </div>

      {/* Meta info */}
      <div className="flex flex-wrap gap-2">
        {/* Priority */}
        <span className={cn('flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium', p.bg, p.color)}>
          <Flag size={11} />
          {p.label} prioridade
        </span>

        {/* Due date */}
        {task.due_date && (
          <span className={cn(
            'flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium',
            overdue
              ? 'bg-red-50 dark:bg-red-950/30 text-red-500'
              : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
          )}>
            <Calendar size={11} />
            {overdue ? 'Atrasada · ' : ''}
            {formatDate(task.due_date)}
          </span>
        )}

        {/* Area */}
        {task.area && (
          <Link
            href={`/areas/${task.area.id}`}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-opacity hover:opacity-80"
            style={{ backgroundColor: task.area.color + '20', color: task.area.color }}
          >
            {task.area.icon} {task.area.name}
          </Link>
        )}
      </div>

      {/* Description */}
      {task.description && (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-4">
          <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-2">Descrição</p>
          <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
            {task.description}
          </p>
        </div>
      )}

      {/* Subtasks */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
            Subtarefas
          </p>
          {totalSubtasks > 0 && (
            <span className="text-xs text-zinc-400 dark:text-zinc-500">
              {completedSubtasks}/{totalSubtasks}
            </span>
          )}
        </div>

        {totalSubtasks > 0 && (
          <div className="h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden mb-3">
            <div
              className="h-full bg-violet-500 rounded-full transition-all duration-500"
              style={{ width: `${totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0}%` }}
            />
          </div>
        )}

        <SubtaskList taskId={task.id} subtasks={task.subtasks ?? []} />
      </div>

      {/* Created at */}
      <p className="text-xs text-zinc-300 dark:text-zinc-700 text-center">
        Criada em {formatDate(task.created_at.split('T')[0])}
      </p>
    </div>
  )
}
