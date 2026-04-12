import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CheckSquare, Target } from 'lucide-react'
import { GoalCard } from '@/components/goals/GoalCard'
import { NewTaskSheet } from '@/components/tasks/NewTaskSheet'
import { TaskCard } from '@/components/tasks/TaskCard'
import { getCurrentUser } from '@/lib/auth'
import { getAreaWithTasks } from '@/lib/actions/goals-areas'

interface Props {
  params: Promise<{ id: string }>
}

export default async function AreaDetailPage({ params }: Props) {
  const user = await getCurrentUser()
  if (!user) redirect('/auth/login')

  const { id } = await params
  const data = await getAreaWithTasks(id)
  if (!data || !data.area) notFound()

  const { area, tasks, goals } = data

  const pendingTasks = tasks.filter((task) => task.status === 'pending')
  const inProgressTasks = tasks.filter((task) => task.status === 'in_progress')
  const doneTasks = tasks.filter((task) => task.status === 'done')
  const activeGoals = goals.filter((goal) => goal.status !== 'done')

  return (
    <div className="space-y-5 pb-4">
      <div className="pt-2">
        <Link
          href="/areas"
          className="mb-3 inline-flex items-center gap-1.5 text-xs text-zinc-400 transition-colors hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
        >
          <ArrowLeft size={13} /> Areas
        </Link>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-2xl text-2xl"
              style={{ backgroundColor: `${area.color}20` }}
            >
              {area.icon}
            </div>
            <div>
              <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{area.name}</h1>
              <div className="mt-0.5 flex items-center gap-3">
                <span className="flex items-center gap-1 text-xs text-zinc-400 dark:text-zinc-500">
                  <CheckSquare size={11} /> {tasks.length} tarefa{tasks.length !== 1 ? 's' : ''}
                </span>
                <span className="flex items-center gap-1 text-xs text-zinc-400 dark:text-zinc-500">
                  <Target size={11} /> {goals.length} meta{goals.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>
          <NewTaskSheet areaId={area.id} areaName={area.name} areaColor={area.color} />
        </div>
      </div>

      {tasks.length > 0 && (
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <p className="text-xs text-zinc-400 dark:text-zinc-500">Progresso das tarefas</p>
            <p className="text-xs font-semibold" style={{ color: area.color }}>
              {Math.round((doneTasks.length / tasks.length) * 100)}%
            </p>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                backgroundColor: area.color,
                width: `${(doneTasks.length / tasks.length) * 100}%`,
              }}
            />
          </div>
        </div>
      )}

      {activeGoals.length > 0 && (
        <section>
          <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
            Metas . {activeGoals.length}
          </h2>
          <div className="space-y-2">
            {activeGoals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </div>
        </section>
      )}

      {tasks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 py-10 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-zinc-400">Nenhuma tarefa nesta area</p>
          <p className="mt-1 text-xs text-zinc-300 dark:text-zinc-600">
            Toque em Nova tarefa para adicionar
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {pendingTasks.length > 0 && (
            <section>
              <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                Pendentes . {pendingTasks.length}
              </p>
              <div className="space-y-2">
                {pendingTasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            </section>
          )}
          {inProgressTasks.length > 0 && (
            <section>
              <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-widest text-amber-400">
                Em andamento . {inProgressTasks.length}
              </p>
              <div className="space-y-2">
                {inProgressTasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            </section>
          )}
          {doneTasks.length > 0 && (
            <section>
              <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-widest text-emerald-500">
                Concluidas . {doneTasks.length}
              </p>
              <div className="space-y-2 opacity-70">
                {doneTasks.map((task) => (
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
