import { redirect } from 'next/navigation'
import { TaskCard } from '@/components/tasks/TaskCard'
import { TaskFilters } from '@/components/tasks/TaskFilters'
import { getCurrentUser } from '@/lib/auth'
import { getAreas } from '@/lib/actions/goals-areas'
import { getTasks } from '@/lib/actions/tasks'
import type { Priority, TaskStatus } from '@/types'

interface Props {
  searchParams: Promise<{
    status?: TaskStatus
    area_id?: string
    priority?: Priority
  }>
}

export default async function TasksPage({ searchParams }: Props) {
  const user = await getCurrentUser()
  if (!user) redirect('/auth/login')

  const params = await searchParams
  const [tasks, areas] = await Promise.all([getTasks(params), getAreas()])

  const pending = tasks.filter((task) => task.status === 'pending')
  const inProgress = tasks.filter((task) => task.status === 'in_progress')
  const done = tasks.filter((task) => task.status === 'done')

  return (
    <div className="space-y-5 pb-4">
      <div className="pt-2">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Tarefas</h1>
        <p className="mt-0.5 text-sm text-zinc-400 dark:text-zinc-500">
          {tasks.length} tarefa{tasks.length !== 1 ? 's' : ''} encontrada
          {tasks.length !== 1 ? 's' : ''}
        </p>
      </div>

      <TaskFilters areas={areas} current={params} />

      {tasks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 py-12 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-zinc-400">Nenhuma tarefa encontrada</p>
          <p className="mt-1 text-xs text-zinc-300 dark:text-zinc-600">Toque no + para criar</p>
        </div>
      ) : (
        <div className="space-y-5">
          {pending.length > 0 && (
            <section>
              <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                Pendentes . {pending.length}
              </p>
              <div className="space-y-2">
                {pending.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            </section>
          )}

          {inProgress.length > 0 && (
            <section>
              <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-widest text-amber-400">
                Em andamento . {inProgress.length}
              </p>
              <div className="space-y-2">
                {inProgress.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            </section>
          )}

          {done.length > 0 && (
            <section>
              <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-widest text-emerald-500">
                Concluidas . {done.length}
              </p>
              <div className="space-y-2 opacity-70">
                {done.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}
