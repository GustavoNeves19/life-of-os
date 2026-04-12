import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, Flag } from 'lucide-react'
import { EditTaskSheet } from '@/components/tasks/EditTaskSheet'
import { SubtaskList } from '@/components/tasks/SubtaskList'
import { TaskStatusSelect } from '@/components/tasks/TaskStatusSelect'
import { getCurrentUser, getServerClient } from '@/lib/auth'
import { getAreas } from '@/lib/actions/goals-areas'
import { cn, formatDate, isOverdue } from '@/lib/utils'
import type { Task } from '@/types'

interface Props {
  params: Promise<{ id: string }>
}

const priorityConfig = {
  high: { label: 'Alta', color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-950/30' },
  medium: {
    label: 'Media',
    color: 'text-amber-500',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
  },
  low: { label: 'Baixa', color: 'text-zinc-400', bg: 'bg-zinc-50 dark:bg-zinc-800' },
} as const

export default async function TaskDetailPage({ params }: Props) {
  const [user, supabase] = await Promise.all([getCurrentUser(), getServerClient()])

  if (!user) redirect('/auth/login')

  const { id } = await params
  const [{ data: task, error }, areas] = await Promise.all([
    supabase
      .from('tasks')
      .select('*, area:life_areas(id, name, color, icon), subtasks(*)')
      .eq('id', id)
      .eq('user_id', user.id)
      .single(),
    getAreas(),
  ])

  if (error || !task) notFound()

  const taskData = task as Task
  const priority = priorityConfig[taskData.priority]
  const overdue = isOverdue(taskData.due_date) && taskData.status !== 'done'
  const completedSubtasks =
    taskData.subtasks?.filter((subtask) => subtask.completed).length ?? 0
  const totalSubtasks = taskData.subtasks?.length ?? 0

  return (
    <div className="space-y-5 pb-4">
      <div className="pt-2">
        <Link
          href="/tasks"
          className="mb-4 inline-flex items-center gap-1.5 text-xs text-zinc-400 transition-colors hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
        >
          <ArrowLeft size={13} /> Tarefas
        </Link>

        <div className="flex items-start justify-between gap-3">
          <h1
            className={cn(
              'flex-1 text-xl font-bold leading-snug text-zinc-900 dark:text-zinc-50',
              taskData.status === 'done' && 'text-zinc-400 line-through dark:text-zinc-500'
            )}
          >
            {taskData.title}
          </h1>
          <div className="flex flex-shrink-0 items-center gap-2">
            <EditTaskSheet task={taskData} areas={areas} />
            <TaskStatusSelect taskId={taskData.id} current={taskData.status} />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <span
          className={cn(
            'flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-medium',
            priority.bg,
            priority.color
          )}
        >
          <Flag size={11} />
          {priority.label} prioridade
        </span>

        {taskData.due_date && (
          <span
            className={cn(
              'flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-medium',
              overdue
                ? 'bg-red-50 text-red-500 dark:bg-red-950/30'
                : 'bg-zinc-50 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
            )}
          >
            <Calendar size={11} />
            {overdue ? 'Atrasada . ' : ''}
            {formatDate(taskData.due_date)}
          </span>
        )}

        {taskData.area && (
          <Link
            href={`/areas/${taskData.area.id}`}
            className="flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-medium transition-opacity hover:opacity-80"
            style={{
              backgroundColor: `${taskData.area.color}20`,
              color: taskData.area.color,
            }}
          >
            {taskData.area.icon} {taskData.area.name}
          </Link>
        )}
      </div>

      {taskData.description && (
        <div className="rounded-2xl border border-zinc-100 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
            Descricao
          </p>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
            {taskData.description}
          </p>
        </div>
      )}

      <div className="rounded-2xl border border-zinc-100 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
            Subtarefas
          </p>
          {totalSubtasks > 0 && (
            <span className="text-xs text-zinc-400 dark:text-zinc-500">
              {completedSubtasks}/{totalSubtasks}
            </span>
          )}
        </div>

        {totalSubtasks > 0 && (
          <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
            <div
              className="h-full rounded-full bg-violet-500 transition-all duration-500"
              style={{
                width: `${(completedSubtasks / totalSubtasks) * 100}%`,
              }}
            />
          </div>
        )}

        <SubtaskList taskId={taskData.id} subtasks={taskData.subtasks ?? []} />
      </div>

      <p className="text-center text-xs text-zinc-300 dark:text-zinc-700">
        Criada em {formatDate(taskData.created_at.split('T')[0])}
      </p>
    </div>
  )
}
