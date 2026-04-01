'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { Task, Priority, TaskStatus } from '@/types'

export async function getTasks(filters?: {
  status?: TaskStatus
  area_id?: string
  priority?: Priority
}): Promise<Task[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  let query = supabase
    .from('tasks')
    .select('*, area:life_areas(id, name, color, icon), subtasks(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (filters?.status) query = query.eq('status', filters.status)
  if (filters?.area_id) query = query.eq('area_id', filters.area_id)
  if (filters?.priority) query = query.eq('priority', filters.priority)

  const { data, error } = await query
  if (error) { console.error(error); return [] }
  return (data as Task[]) ?? []
}

export async function getTodayTasks(): Promise<Task[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('tasks')
    .select('*, area:life_areas(id, name, color, icon), subtasks(*)')
    .eq('user_id', user.id)
    .neq('status', 'done')
    .or(`due_date.eq.${today},priority.eq.high`)
    .order('priority', { ascending: false })
    .limit(10)

  if (error) { console.error(error); return [] }
  return (data as Task[]) ?? []
}

export async function createTask(formData: {
  title: string
  description?: string
  area_id?: string
  priority: Priority
  due_date?: string
}): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const { error } = await supabase.from('tasks').insert({
    ...formData,
    user_id: user.id,
    status: 'pending',
  })

  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  revalidatePath('/tasks')
  return {}
}

export async function updateTaskStatus(
  taskId: string,
  status: TaskStatus
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const { error } = await supabase
    .from('tasks')
    .update({ status })
    .eq('id', taskId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  revalidatePath('/tasks')
  return {}
}

export async function deleteTask(taskId: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  revalidatePath('/tasks')
  return {}
}

export async function toggleSubtask(
  subtaskId: string,
  completed: boolean
): Promise<{ error?: string }> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('subtasks')
    .update({ completed })
    .eq('id', subtaskId)

  if (error) return { error: error.message }
  revalidatePath('/tasks')
  return {}
}
