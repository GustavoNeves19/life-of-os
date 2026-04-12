'use server'

import { revalidatePath } from 'next/cache'
import { getCurrentUser, getServerClient } from '@/lib/auth'
import { localDateString } from '@/lib/utils'
import type { Priority, Subtask, Task, TaskStatus } from '@/types'

export async function getTasks(filters?: {
  status?: TaskStatus
  area_id?: string
  priority?: Priority
}): Promise<Task[]> {
  const [supabase, user] = await Promise.all([getServerClient(), getCurrentUser()])

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

  if (error) {
    console.error(error)
    return []
  }

  return (data as Task[]) ?? []
}

export async function getTodayTasks(): Promise<Task[]> {
  const [supabase, user] = await Promise.all([getServerClient(), getCurrentUser()])

  if (!user) return []

  const today = localDateString()

  const { data, error } = await supabase
    .from('tasks')
    .select('*, area:life_areas(id, name, color, icon), subtasks(*)')
    .eq('user_id', user.id)
    .neq('status', 'done')
    .or(`due_date.eq.${today},priority.eq.high`)
    .order('priority', { ascending: false })
    .limit(10)

  if (error) {
    console.error(error)
    return []
  }

  return (data as Task[]) ?? []
}

export async function createTask(formData: {
  title: string
  description?: string
  area_id?: string
  priority: Priority
  status?: TaskStatus
  due_date?: string
}): Promise<{ error?: string }> {
  const [supabase, user] = await Promise.all([getServerClient(), getCurrentUser()])

  if (!user) return { error: 'Nao autenticado' }

  const { error } = await supabase.from('tasks').insert({
    title: formData.title.trim(),
    description: formData.description?.trim() || null,
    area_id: formData.area_id || null,
    priority: formData.priority,
    due_date: formData.due_date || null,
    user_id: user.id,
    status: formData.status ?? 'pending',
  })

  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  revalidatePath('/tasks')
  revalidatePath('/areas')

  if (formData.area_id) {
    revalidatePath(`/areas/${formData.area_id}`)
  }

  return {}
}

export async function updateTask(formData: {
  taskId: string
  title: string
  description?: string
  area_id?: string
  priority: Priority
  status: TaskStatus
  due_date?: string
}): Promise<{ error?: string }> {
  const [supabase, user] = await Promise.all([getServerClient(), getCurrentUser()])

  if (!user) return { error: 'Nao autenticado' }

  const { data: existingTask } = await supabase
    .from('tasks')
    .select('area_id')
    .eq('id', formData.taskId)
    .eq('user_id', user.id)
    .single()

  if (!existingTask) return { error: 'Tarefa nao encontrada' }

  const normalizedAreaId = formData.area_id || null

  const { error } = await supabase
    .from('tasks')
    .update({
      title: formData.title.trim(),
      description: formData.description?.trim() || null,
      area_id: normalizedAreaId,
      priority: formData.priority,
      status: formData.status,
      due_date: formData.due_date || null,
    })
    .eq('id', formData.taskId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  revalidatePath('/tasks')
  revalidatePath('/areas')
  revalidatePath(`/tasks/${formData.taskId}`)

  if (existingTask.area_id) {
    revalidatePath(`/areas/${existingTask.area_id}`)
  }

  if (normalizedAreaId && normalizedAreaId !== existingTask.area_id) {
    revalidatePath(`/areas/${normalizedAreaId}`)
  }

  return {}
}

export async function updateTaskStatus(
  taskId: string,
  status: TaskStatus
): Promise<{ error?: string }> {
  const [supabase, user] = await Promise.all([getServerClient(), getCurrentUser()])

  if (!user) return { error: 'Nao autenticado' }

  const { data: existingTask } = await supabase
    .from('tasks')
    .select('area_id')
    .eq('id', taskId)
    .eq('user_id', user.id)
    .single()

  const { error } = await supabase
    .from('tasks')
    .update({ status })
    .eq('id', taskId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  revalidatePath('/tasks')
  revalidatePath(`/tasks/${taskId}`)
  revalidatePath('/areas')

  if (existingTask?.area_id) {
    revalidatePath(`/areas/${existingTask.area_id}`)
  }

  return {}
}

export async function deleteTask(taskId: string): Promise<{ error?: string }> {
  const [supabase, user] = await Promise.all([getServerClient(), getCurrentUser()])

  if (!user) return { error: 'Nao autenticado' }

  const { data: existingTask } = await supabase
    .from('tasks')
    .select('area_id')
    .eq('id', taskId)
    .eq('user_id', user.id)
    .single()

  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  revalidatePath('/tasks')
  revalidatePath('/areas')

  if (existingTask?.area_id) {
    revalidatePath(`/areas/${existingTask.area_id}`)
  }

  return {}
}

export async function createSubtask(
  taskId: string,
  title: string
): Promise<{ data?: Subtask; error?: string }> {
  const [supabase, user] = await Promise.all([getServerClient(), getCurrentUser()])

  if (!user) return { error: 'Nao autenticado' }

  const { data: task } = await supabase
    .from('tasks')
    .select('id')
    .eq('id', taskId)
    .eq('user_id', user.id)
    .single()

  if (!task) return { error: 'Tarefa nao encontrada' }

  const { data, error } = await supabase
    .from('subtasks')
    .insert({ task_id: taskId, title: title.trim(), completed: false })
    .select()
    .single()

  if (error) return { error: error.message }

  revalidatePath('/tasks')
  revalidatePath(`/tasks/${taskId}`)

  return { data: (data as Subtask) ?? undefined }
}

export async function deleteSubtask(subtaskId: string): Promise<{ error?: string }> {
  const [supabase, user] = await Promise.all([getServerClient(), getCurrentUser()])

  if (!user) return { error: 'Nao autenticado' }

  const { data: subtask } = await supabase
    .from('subtasks')
    .select('id, task_id, tasks!inner(user_id)')
    .eq('id', subtaskId)
    .eq('tasks.user_id', user.id)
    .single()

  if (!subtask) return { error: 'Subtarefa nao encontrada' }

  const { error } = await supabase.from('subtasks').delete().eq('id', subtaskId)

  if (error) return { error: error.message }

  revalidatePath('/tasks')
  revalidatePath(`/tasks/${subtask.task_id}`)

  return {}
}

export async function toggleSubtask(
  subtaskId: string,
  completed: boolean
): Promise<{ error?: string }> {
  const [supabase, user] = await Promise.all([getServerClient(), getCurrentUser()])

  if (!user) return { error: 'Nao autenticado' }

  const { data: subtask } = await supabase
    .from('subtasks')
    .select('task_id, tasks!inner(user_id)')
    .eq('id', subtaskId)
    .eq('tasks.user_id', user.id)
    .single()

  if (!subtask) return { error: 'Subtarefa nao encontrada' }

  const { error } = await supabase
    .from('subtasks')
    .update({ completed })
    .eq('id', subtaskId)

  if (error) return { error: error.message }

  revalidatePath('/tasks')
  revalidatePath(`/tasks/${subtask.task_id}`)

  return {}
}
