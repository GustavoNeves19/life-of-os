import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getTodayTasks } from '@/lib/actions/tasks'
import { getGoals } from '@/lib/actions/goals-areas'
import { getFinances } from '@/lib/actions/finances'
import { TaskCard } from '@/components/tasks/TaskCard'
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

function greeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Bom dia'
  if (hour < 18) return 'Boa tarde'
  return 'Boa noite'
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const metadataName =
    typeof user.user_metadata?.full_name === 'string'
      ? user.user_metadata.full_name.trim()
      : ''
  const fallbackName = user.email?.split('@')[0] ?? 'você'
  const firstName = (metadataName || fallbackName).split(/\s+/)[0]

  const [todayTasks, goals, finances] = await Promise.all([
    getTodayTasks(),
    getGoals(),
    getFinances(),
  ])

  const activeGoals = goals.filter((goal) => goal.status !== 'done').slice(0, 3)
  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  return (
    <div className="space-y-6 pb-4">
      <div className="pt-2">
        <p className="text-sm capitalize text-zinc-400 dark:text-zinc-500">{today}</p>
        <h1 className="mt-0.5 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          {greeting()}, {firstName} 👋
        </h1>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl bg-violet-50 p-3 text-center dark:bg-violet-950/30">
          <p className="text-2xl font-bold text-violet-700 dark:text-violet-400">
            {todayTasks.filter((task) => task.status !== 'done').length}
          </p>
          <p className="mt-0.5 text-[11px] text-violet-500 dark:text-violet-400">
            tarefas hoje
          </p>
        </div>

        <div className="rounded-2xl bg-amber-50 p-3 text-center dark:bg-amber-950/30">
          <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">
            {activeGoals.length}
          </p>
          <p className="mt-0.5 text-[11px] text-amber-500 dark:text-amber-400">
            metas ativas
          </p>
        </div>

        <div
          className={cn(
            'rounded-2xl p-3 text-center',
            finances.balance >= 0
              ? 'bg-emerald-50 dark:bg-emerald-950/30'
              : 'bg-red-50 dark:bg-red-950/30'
          )}
        >
          <p
            className={cn(
              'text-lg font-bold',
              finances.balance >= 0
                ? 'text-emerald-700 dark:text-emerald-400'
                : 'text-red-600 dark:text-red-400'
            )}
          >
            {formatCurrency(finances.balance)}
          </p>
          <p
            className={cn(
              'mt-0.5 text-[11px]',
              finances.balance >= 0
                ? 'text-emerald-500 dark:text-emerald-400'
                : 'text-red-500 dark:text-red-400'
            )}
          >
            saldo mês
          </p>
        </div>
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
            Prioridades de hoje
          </h2>
          <Link
            href="/tasks"
            className="flex items-center gap-1 text-xs font-medium text-violet-600 dark:text-violet-400"
          >
            Ver todas <ArrowRight size={12} />
          </Link>
        </div>

        {todayTasks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 py-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-sm text-zinc-400">Nenhuma tarefa para hoje</p>
            <p className="mt-1 text-xs text-zinc-300 dark:text-zinc-600">
              Toque no + para adicionar
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {todayTasks.slice(0, 5).map((task) => (
              <TaskCard key={task.id} task={task} compact />
            ))}
          </div>
        )}
      </section>

      {activeGoals.length > 0 && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
              Metas em andamento
            </h2>
            <Link
              href="/goals"
              className="flex items-center gap-1 text-xs font-medium text-violet-600 dark:text-violet-400"
            >
              Ver todas <ArrowRight size={12} />
            </Link>
          </div>

          <div className="space-y-2">
            {activeGoals.map((goal) => (
              <div
                key={goal.id}
                className="rounded-xl border border-zinc-100 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="mb-2 flex items-start justify-between gap-2">
                  <p className="line-clamp-1 text-sm font-medium text-zinc-800 dark:text-zinc-100">
                    {goal.title}
                  </p>
                  <span className="flex-shrink-0 text-xs font-semibold text-violet-600 dark:text-violet-400">
                    {goal.progress}%
                  </span>
                </div>

                <div className="h-1.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <div
                    className="h-full rounded-full bg-violet-500 transition-all duration-500"
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
            Resumo financeiro
          </h2>
          <Link
            href="/finances"
            className="flex items-center gap-1 text-xs font-medium text-violet-600 dark:text-violet-400"
          >
            Detalhes <ArrowRight size={12} />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-emerald-50 p-3.5 dark:bg-emerald-950/30">
            <div className="mb-1 flex items-center gap-1.5">
              <TrendingUp size={14} className="text-emerald-600 dark:text-emerald-400" />
              <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                Receitas
              </p>
            </div>

            <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
              {formatCurrency(finances.totalIncome)}
            </p>
          </div>

          <div className="rounded-2xl bg-red-50 p-3.5 dark:bg-red-950/30">
            <div className="mb-1 flex items-center gap-1.5">
              <TrendingDown size={14} className="text-red-500 dark:text-red-400" />
              <p className="text-xs font-medium text-red-500 dark:text-red-400">
                Despesas
              </p>
            </div>

            <p className="text-lg font-bold text-red-600 dark:text-red-300">
              {formatCurrency(finances.totalExpenses)}
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
