import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getTasks } from '@/lib/actions/tasks'
import { getAreas } from '@/lib/actions/goals-areas'
import { TaskCard } from '@/components/tasks/TaskCard'
import { TaskFilters } from '@/components/tasks/TaskFilters'
import type { TaskStatus, Priority } from '@/types'

interface Props {
  searchParams: Promise<{
    status?: TaskStatus
    area_id?: string
    priority?: Priority
  }>
}

export default async function TasksPage({ searchParams }: Props) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const params = await searchParams
  const [tasks, areas] = await Promise.all([
    getTasks(params),
    getAreas(),
  ])

  const pending = tasks.filter(t => t.status === 'pending')
  const inProgress = tasks.filter(t => t.status === 'in_progress')
  const done = tasks.filter(t => t.status === 'done')

  return (
    <div className="space-y-5 pb-4">
      <div className="pt-2">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Tarefas</h1>
        <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-0.5">
          {tasks.length} tarefa{tasks.length !== 1 ? 's' : ''} encontrada{tasks.length !== 1 ? 's' : ''}
        </p>
      </div>

      <TaskFilters areas={areas} current={params} />

      {tasks.length === 0 ? (
        <div className="text-center py-12 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800">
          <p className="text-zinc-400">Nenhuma tarefa encontrada</p>
          <p className="text-xs text-zinc-300 dark:text-zinc-600 mt-1">Toque no + para criar</p>
        </div>
      ) : (
        <div className="space-y-5">
          {pending.length > 0 && (
            <section>
              <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-2 px-1">
                Pendentes · {pending.length}
              </p>
              <div className="space-y-2">
                {pending.map(t => <TaskCard key={t.id} task={t} />)}
              </div>
            </section>
          )}
          {inProgress.length > 0 && (
            <section>
              <p className="text-xs font-semibold text-amber-400 uppercase tracking-widest mb-2 px-1">
                Em andamento · {inProgress.length}
              </p>
              <div className="space-y-2">
                {inProgress.map(t => <TaskCard key={t.id} task={t} />)}
              </div>
            </section>
          )}
          {done.length > 0 && (
            <section>
              <p className="text-xs font-semibold text-emerald-500 uppercase tracking-widest mb-2 px-1">
                Concluídas · {done.length}
              </p>
              <div className="space-y-2 opacity-70">
                {done.map(t => <TaskCard key={t.id} task={t} />)}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}
