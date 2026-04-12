import { redirect } from 'next/navigation'
import { GoalCard } from '@/components/goals/GoalCard'
import { NewGoalSheet } from '@/components/goals/NewGoalSheet'
import { getCurrentUser } from '@/lib/auth'
import { getAreas, getGoals } from '@/lib/actions/goals-areas'
import type { GoalTimeframe } from '@/types'

const timeframes: { key: GoalTimeframe; label: string; emoji: string; desc: string }[] = [
  { key: 'short', label: 'Curto prazo', emoji: '⚡', desc: 'ate 3 meses' },
  { key: 'medium', label: 'Medio prazo', emoji: '🎯', desc: '3-12 meses' },
  { key: 'long', label: 'Longo prazo', emoji: '🚀', desc: 'mais de 1 ano' },
]

export default async function GoalsPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/auth/login')

  const [goals, areas] = await Promise.all([getGoals(), getAreas()])

  const active = goals.filter((goal) => goal.status !== 'done')
  const done = goals.filter((goal) => goal.status === 'done')

  return (
    <div className="space-y-6 pb-4">
      <div className="flex items-start justify-between pt-2">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Metas</h1>
          <p className="mt-0.5 text-sm text-zinc-400 dark:text-zinc-500">
            {active.length} ativa{active.length !== 1 ? 's' : ''} . {done.length} concluida
            {done.length !== 1 ? 's' : ''}
          </p>
        </div>
        <NewGoalSheet areas={areas} />
      </div>

      {goals.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 py-14 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <p className="mb-3 text-4xl">🎯</p>
          <p className="font-medium text-zinc-500">Nenhuma meta ainda</p>
          <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-600">
            Defina onde quer chegar
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {timeframes.map(({ key, label, emoji, desc }) => {
            const grouped = active.filter((goal) => goal.timeframe === key)
            if (grouped.length === 0) return null

            return (
              <section key={key}>
                <div className="mb-3 flex items-center gap-2">
                  <span className="text-base">{emoji}</span>
                  <div>
                    <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                      {label}
                    </h2>
                    <p className="text-[11px] text-zinc-400">{desc}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {grouped.map((goal) => (
                    <GoalCard key={goal.id} goal={goal} />
                  ))}
                </div>
              </section>
            )
          })}

          {done.length > 0 && (
            <section>
              <h2 className="mb-3 px-1 text-xs font-semibold uppercase tracking-widest text-emerald-500">
                Concluidas . {done.length}
              </h2>
              <div className="space-y-2 opacity-60">
                {done.map((goal) => (
                  <GoalCard key={goal.id} goal={goal} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}
