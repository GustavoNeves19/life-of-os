'use server'

import { revalidatePath } from 'next/cache'
import { getCurrentUser, getServerClient } from '@/lib/auth'
import type { Goal, GoalTimeframe, LifeArea, TaskStatus } from '@/types'

export async function getGoals(): Promise<Goal[]> {
  const [supabase, user] = await Promise.all([getServerClient(), getCurrentUser()])
  if (!user) return []

  const { data, error } = await supabase
    .from('goals')
    .select('*, area:life_areas(id, name, color, icon)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return []
  return (data as Goal[]) ?? []
}

export async function createGoal(formData: {
  title: string
  timeframe: GoalTimeframe
  area_id?: string
  target_date?: string
}): Promise<{ error?: string }> {
  const [supabase, user] = await Promise.all([getServerClient(), getCurrentUser()])
  if (!user) return { error: 'Nao autenticado' }

  const { error } = await supabase.from('goals').insert({
    ...formData,
    user_id: user.id,
    status: 'pending',
    progress: 0,
  })

  if (error) return { error: error.message }

  revalidatePath('/goals')
  revalidatePath('/dashboard')
  return {}
}

export async function updateGoalProgress(
  goalId: string,
  progress: number
): Promise<{ error?: string }> {
  const [supabase, user] = await Promise.all([getServerClient(), getCurrentUser()])
  if (!user) return { error: 'Nao autenticado' }

  const status: TaskStatus = progress >= 100 ? 'done' : 'in_progress'

  const { error } = await supabase
    .from('goals')
    .update({ progress, status })
    .eq('id', goalId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/goals')
  revalidatePath('/dashboard')
  return {}
}

export async function getAreas(): Promise<LifeArea[]> {
  const [supabase, user] = await Promise.all([getServerClient(), getCurrentUser()])
  if (!user) return []

  const { data, error } = await supabase
    .from('life_areas')
    .select('*')
    .eq('user_id', user.id)
    .order('sort_order', { ascending: true })

  if (error) return []
  return (data as LifeArea[]) ?? []
}

export async function getAreaWithTasks(areaId: string) {
  const [supabase, user] = await Promise.all([getServerClient(), getCurrentUser()])
  if (!user) return null

  const [{ data: area }, { data: tasks }, { data: goals }] = await Promise.all([
    supabase
      .from('life_areas')
      .select('*')
      .eq('id', areaId)
      .eq('user_id', user.id)
      .single(),
    supabase
      .from('tasks')
      .select('*, subtasks(*)')
      .eq('area_id', areaId)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    supabase.from('goals').select('*').eq('area_id', areaId).eq('user_id', user.id),
  ])

  return { area, tasks: tasks ?? [], goals: goals ?? [] }
}
