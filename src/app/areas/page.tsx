import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, CheckSquare, Target } from 'lucide-react'
import { getCurrentUser, getServerClient } from '@/lib/auth'
import { getAreas } from '@/lib/actions/goals-areas'

export default async function AreasPage() {
  const [user, supabase] = await Promise.all([getCurrentUser(), getServerClient()])
  if (!user) redirect('/auth/login')

  const areas = await getAreas()

  const [{ data: taskCounts }, { data: goalCounts }] = await Promise.all([
    supabase.from('tasks').select('area_id').eq('user_id', user.id).neq('status', 'done'),
    supabase.from('goals').select('area_id').eq('user_id', user.id).neq('status', 'done'),
  ])

  const taskCountMap =
    taskCounts?.reduce(
      (acc, task) => {
        if (task.area_id) acc[task.area_id] = (acc[task.area_id] ?? 0) + 1
        return acc
      },
      {} as Record<string, number>
    ) ?? {}

  const goalCountMap =
    goalCounts?.reduce(
      (acc, goal) => {
        if (goal.area_id) acc[goal.area_id] = (acc[goal.area_id] ?? 0) + 1
        return acc
      },
      {} as Record<string, number>
    ) ?? {}

  return (
    <div className="space-y-5 pb-4">
      <div className="pt-2">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Areas da Vida</h1>
        <p className="mt-0.5 text-sm text-zinc-400 dark:text-zinc-500">
          Organize sua rotina por contexto
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {areas.map((area) => {
          const taskCount = taskCountMap[area.id] ?? 0
          const goalCount = goalCountMap[area.id] ?? 0

          return (
            <Link
              key={area.id}
              href={`/areas/${area.id}`}
              className="group rounded-2xl border border-zinc-100 bg-white p-4 transition-all hover:border-zinc-200 hover:shadow-sm active:scale-[0.99] dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-xl text-xl"
                    style={{ backgroundColor: `${area.color}20` }}
                  >
                    {area.icon}
                  </div>
                  <div>
                    <h3 className="text-[15px] font-semibold text-zinc-900 dark:text-zinc-100">
                      {area.name}
                    </h3>
                    <div className="mt-0.5 flex items-center gap-3">
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
                        <span className="text-[11px] text-zinc-300 dark:text-zinc-600">
                          Nenhuma atividade
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <ArrowRight
                  size={16}
                  className="text-zinc-300 transition-colors group-hover:text-zinc-400 dark:text-zinc-600 dark:group-hover:text-zinc-500"
                  style={{ color: `${area.color}80` }}
                />
              </div>

              {(taskCount > 0 || goalCount > 0) && (
                <div className="mt-3 h-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
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
