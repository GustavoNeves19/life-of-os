import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getAreas } from '@/lib/actions/goals-areas'
import Link from 'next/link'
import { ArrowRight, CheckSquare, Target } from 'lucide-react'

export default async function AreasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const areas = await getAreas()

  // Fetch task counts per area
  const { data: taskCounts } = await supabase
    .from('tasks')
    .select('area_id')
    .eq('user_id', user.id)
    .neq('status', 'done')

  const { data: goalCounts } = await supabase
    .from('goals')
    .select('area_id')
    .eq('user_id', user.id)
    .neq('status', 'done')

  const taskCountMap = taskCounts?.reduce((acc, t) => {
    if (t.area_id) acc[t.area_id] = (acc[t.area_id] ?? 0) + 1
    return acc
  }, {} as Record<string, number>) ?? {}

  const goalCountMap = goalCounts?.reduce((acc, g) => {
    if (g.area_id) acc[g.area_id] = (acc[g.area_id] ?? 0) + 1
    return acc
  }, {} as Record<string, number>) ?? {}

  return (
    <div className="space-y-5 pb-4">
      <div className="pt-2">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Áreas da Vida</h1>
        <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-0.5">Organize sua rotina por contexto</p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {areas.map(area => {
          const taskCount = taskCountMap[area.id] ?? 0
          const goalCount = goalCountMap[area.id] ?? 0

          return (
            <Link
              key={area.id}
              href={`/areas/${area.id}`}
              className="group bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-4 transition-all hover:border-zinc-200 dark:hover:border-zinc-700 hover:shadow-sm active:scale-[0.99]"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-xl"
                    style={{ backgroundColor: area.color + '20' }}
                  >
                    {area.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-[15px]">
                      {area.name}
                    </h3>
                    <div className="flex items-center gap-3 mt-0.5">
                      {taskCount > 0 && (
                        <span className="flex items-center gap-1 text-[11px] text-zinc-400 dark:text-zinc-500">
                          <CheckSquare size={10} />
                          {taskCount} tarefa{taskCount !== 1 ? 's' : ''}
                        </span>
                      )}
                      {goalCount > 0 && (
                        <span className="flex items-center gap-1 text-[11px] text-zinc-400 dark:text-zinc-500">
                          <Target size={10} />
                          {goalCount} meta{goalCount !== 1 ? 's' : ''}
                        </span>
                      )}
                      {taskCount === 0 && goalCount === 0 && (
                        <span className="text-[11px] text-zinc-300 dark:text-zinc-600">Nenhuma atividade</span>
                      )}
                    </div>
                  </div>
                </div>
                <ArrowRight
                  size={16}
                  className="text-zinc-300 dark:text-zinc-600 group-hover:text-zinc-400 dark:group-hover:text-zinc-500 transition-colors"
                  style={{ color: area.color + '80' }}
                />
              </div>

              {/* Mini progress bar for tasks */}
              {(taskCount > 0 || goalCount > 0) && (
                <div className="mt-3 h-1 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      backgroundColor: area.color,
                      width: `${Math.min(100, (taskCount + goalCount) * 10)}%`,
                    }}
                  />
                </div>
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
