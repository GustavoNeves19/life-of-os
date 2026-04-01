import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getGoals } from '@/lib/actions/goals-areas'
import { GoalCard } from '@/components/goals/GoalCard'
import { NewGoalSheet } from '@/components/goals/NewGoalSheet'
import { getAreas } from '@/lib/actions/goals-areas'
import type { GoalTimeframe } from '@/types'

const timeframes: { key: GoalTimeframe; label: string; emoji: string; desc: string }[] = [
  { key: 'short',  label: 'Curto prazo',  emoji: '⚡', desc: 'até 3 meses'   },
  { key: 'medium', label: 'Médio prazo',  emoji: '🎯', desc: '3–12 meses'    },
  { key: 'long',   label: 'Longo prazo',  emoji: '🚀', desc: 'mais de 1 ano' },
]

export default async function GoalsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [goals, areas] = await Promise.all([getGoals(), getAreas()])

  const active = goals.filter(g => g.status !== 'done')
  const done   = goals.filter(g => g.status === 'done')

  return (
    <div className="space-y-6 pb-4">
      <div className="pt-2 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Metas</h1>
          <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-0.5">
            {active.length} ativa{active.length !== 1 ? 's' : ''} · {done.length} concluída{done.length !== 1 ? 's' : ''}
          </p>
        </div>
        <NewGoalSheet areas={areas} />
      </div>

      {goals.length === 0 ? (
        <div className="text-center py-14 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800">
          <p className="text-4xl mb-3">🎯</p>
          <p className="text-zinc-500 font-medium">Nenhuma meta ainda</p>
          <p className="text-xs text-zinc-400 dark:text-zinc-600 mt-1">Defina onde quer chegar</p>
        </div>
      ) : (
        <div className="space-y-6">
          {timeframes.map(({ key, label, emoji, desc }) => {
            const grouped = active.filter(g => g.timeframe === key)
            if (grouped.length === 0) return null
            return (
              <section key={key}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-base">{emoji}</span>
                  <div>
                    <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">{label}</h2>
                    <p className="text-[11px] text-zinc-400">{desc}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {grouped.map(goal => (
                    <GoalCard key={goal.id} goal={goal} />
                  ))}
                </div>
              </section>
            )
          })}

          {done.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold text-emerald-500 uppercase tracking-widest mb-3 px-1">
                ✓ Concluídas · {done.length}
              </h2>
              <div className="space-y-2 opacity-60">
                {done.map(goal => <GoalCard key={goal.id} goal={goal} />)}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}
