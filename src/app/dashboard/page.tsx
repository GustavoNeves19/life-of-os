import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getTodayTasks } from '@/lib/actions/tasks'
import { getGoals } from '@/lib/actions/goals-areas'
import { getFinances } from '@/lib/actions/finances'
import { TaskCard } from '@/components/tasks/TaskCard'
import { Target, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}

function formatCurrency(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()
    .then(res => res)
    .catch(() => ({ data: null }))

  const firstName = (profile?.full_name ?? user.email ?? 'você').split(' ')[0]

  const [todayTasks, goals, finances] = await Promise.all([
    getTodayTasks(),
    getGoals(),
    getFinances(),
  ])

  const activeGoals = goals.filter(g => g.status !== 'done').slice(0, 3)
  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long'
  })

  return (
    <div className="space-y-6 pb-4">
      {/* Header */}
      <div className="pt-2">
        <p className="text-sm text-zinc-400 dark:text-zinc-500 capitalize">{today}</p>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-0.5">
          {greeting()}, {firstName} 👋
        </h1>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-violet-50 dark:bg-violet-950/30 rounded-2xl p-3 text-center">
          <p className="text-2xl font-bold text-violet-700 dark:text-violet-400">
            {todayTasks.filter(t => t.status !== 'done').length}
          </p>
          <p className="text-[11px] text-violet-500 dark:text-violet-400 mt-0.5">tarefas hoje</p>
        </div>
        <div className="bg-amber-50 dark:bg-amber-950/30 rounded-2xl p-3 text-center">
          <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">
            {activeGoals.length}
          </p>
          <p className="text-[11px] text-amber-500 dark:text-amber-400 mt-0.5">metas ativas</p>
        </div>
        <div className={cn(
          'rounded-2xl p-3 text-center',
          finances.balance >= 0
            ? 'bg-emerald-50 dark:bg-emerald-950/30'
            : 'bg-red-50 dark:bg-red-950/30'
        )}>
          <p className={cn(
            'text-lg font-bold',
            finances.balance >= 0
              ? 'text-emerald-700 dark:text-emerald-400'
              : 'text-red-600 dark:text-red-400'
          )}>
            {formatCurrency(finances.balance)}
          </p>
          <p className={cn(
            'text-[11px] mt-0.5',
            finances.balance >= 0
              ? 'text-emerald-500 dark:text-emerald-400'
              : 'text-red-500 dark:text-red-400'
          )}>saldo mês</p>
        </div>
      </div>

      {/* Today's tasks */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
            Prioridades de hoje
          </h2>
          <Link
            href="/tasks"
            className="flex items-center gap-1 text-xs text-violet-600 dark:text-violet-400 font-medium"
          >
            Ver todas <ArrowRight size={12} />
          </Link>
        </div>

        {todayTasks.length === 0 ? (
          <div className="text-center py-8 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800">
            <p className="text-sm text-zinc-400">Nenhuma tarefa para hoje</p>
            <p className="text-xs text-zinc-300 dark:text-zinc-600 mt-1">Toque no + para adicionar</p>
          </div>
        ) : (
          <div className="space-y-2">
            {todayTasks.slice(0, 5).map(task => (
              <TaskCard key={task.id} task={task} compact />
            ))}
          </div>
        )}
      </section>

      {/* Active goals */}
      {activeGoals.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
              Metas em andamento
            </h2>
            <Link
              href="/goals"
              className="flex items-center gap-1 text-xs text-violet-600 dark:text-violet-400 font-medium"
            >
              Ver todas <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-2">
            {activeGoals.map(goal => (
              <div
                key={goal.id}
                className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800 p-3"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100 line-clamp-1">
                    {goal.title}
                  </p>
                  <span className="text-xs font-semibold text-violet-600 dark:text-violet-400 flex-shrink-0">
                    {goal.progress}%
                  </span>
                </div>
                <div className="h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-violet-500 rounded-full transition-all duration-500"
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Finance summary */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
            Resumo financeiro
          </h2>
          <Link
            href="/finances"
            className="flex items-center gap-1 text-xs text-violet-600 dark:text-violet-400 font-medium"
          >
            Detalhes <ArrowRight size={12} />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl p-3.5">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingUp size={14} className="text-emerald-600 dark:text-emerald-400" />
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Receitas</p>
            </div>
            <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
              {formatCurrency(finances.totalIncome)}
            </p>
          </div>
          <div className="bg-red-50 dark:bg-red-950/30 rounded-2xl p-3.5">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingDown size={14} className="text-red-500 dark:text-red-400" />
              <p className="text-xs text-red-500 dark:text-red-400 font-medium">Despesas</p>
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
