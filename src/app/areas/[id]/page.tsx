import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getAreaWithTasks } from '@/lib/actions/goals-areas'
import { TaskCard } from '@/components/tasks/TaskCard'
import { GoalCard } from '@/components/goals/GoalCard'
import { NewTaskSheet } from '@/components/tasks/NewTaskSheet'
import { ArrowLeft, CheckSquare, Target } from 'lucide-react'
import Link from 'next/link'

interface Props {
  params: Promise<{ id: string }>
}

export default async function AreaDetailPage({ params }: Props) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { id } = await params
  const data = await getAreaWithTasks(id)
  if (!data || !data.area) notFound()

  const { area, tasks, goals } = data

  const pendingTasks    = tasks.filter(t => t.status === 'pending')
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress')
  const doneTasks       = tasks.filter(t => t.status === 'done')
  const activeGoals     = goals.filter(g => g.status !== 'done')

  return (
    <div className="space-y-5 pb-4">
      {/* Header */}
      <div className="pt-2">
        <Link href="/areas" className="inline-flex items-center gap-1.5 text-xs text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 mb-3 transition-colors">
          <ArrowLeft size={13} /> Áreas
        </Link>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
              style={{ backgroundColor: area.color + '20' }}
            >
              {area.icon}
            </div>
            <div>
              <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{area.name}</h1>
              <div className="flex items-center gap-3 mt-0.5">
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

      {/* Progress bar */}
      {tasks.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-xs text-zinc-400 dark:text-zinc-500">Progresso das tarefas</p>
            <p className="text-xs font-semibold" style={{ color: area.color }}>
              {Math.round((doneTasks.length / tasks.length) * 100)}%
            </p>
          </div>
          <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
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

      {/* Active goals */}
      {activeGoals.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-2 px-1">
            Metas · {activeGoals.length}
          </h2>
          <div className="space-y-2">
            {activeGoals.map(goal => <GoalCard key={goal.id} goal={goal} />)}
          </div>
        </section>
      )}

      {/* Tasks */}
      {tasks.length === 0 ? (
        <div className="text-center py-10 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800">
          <p className="text-zinc-400 text-sm">Nenhuma tarefa nesta área</p>
          <p className="text-xs text-zinc-300 dark:text-zinc-600 mt-1">Toque em Nova tarefa para adicionar</p>
        </div>
      ) : (
        <div className="space-y-5">
          {pendingTasks.length > 0 && (
            <section>
              <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-2 px-1">
                Pendentes · {pendingTasks.length}
              </p>
              <div className="space-y-2">
                {pendingTasks.map(t => <TaskCard key={t.id} task={t} />)}
              </div>
            </section>
          )}
          {inProgressTasks.length > 0 && (
            <section>
              <p className="text-xs font-semibold text-amber-400 uppercase tracking-widest mb-2 px-1">
                Em andamento · {inProgressTasks.length}
              </p>
              <div className="space-y-2">
                {inProgressTasks.map(t => <TaskCard key={t.id} task={t} />)}
              </div>
            </section>
          )}
          {doneTasks.length > 0 && (
            <section>
              <p className="text-xs font-semibold text-emerald-500 uppercase tracking-widest mb-2 px-1">
                Concluídas · {doneTasks.length}
              </p>
              <div className="space-y-2 opacity-70">
                {doneTasks.map(t => <TaskCard key={t.id} task={t} />)}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}
