'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { localDateString } from '@/lib/utils'
import type { Priority, Subtask, Task, TaskStatus } from '@/types'

export async function getTasks(filters?: {
  status?: TaskStatus
  area_id?: string
  priority?: Priority
}): Promise<Task[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

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
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

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
  due_date?: string
}): Promise<{ error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Não autenticado' }

  const { error } = await supabase.from('tasks').insert({
    ...formData,
    user_id: user.id,
    status: 'pending',
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

export async function updateTaskStatus(
  taskId: string,
  status: TaskStatus
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Não autenticado' }

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
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Não autenticado' }

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
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Não autenticado' }

  const { data: task } = await supabase
    .from('tasks')
    .select('id')
    .eq('id', taskId)
    .eq('user_id', user.id)
    .single()

  if (!task) return { error: 'Tarefa não encontrada' }

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
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Não autenticado' }

  const { data: subtask } = await supabase
    .from('subtasks')
    .select('id, task_id, tasks!inner(user_id)')
    .eq('id', subtaskId)
    .eq('tasks.user_id', user.id)
    .single()

  if (!subtask) return { error: 'Subtarefa não encontrada' }

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
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Não autenticado' }

  const { data: subtask } = await supabase
    .from('subtasks')
    .select('task_id, tasks!inner(user_id)')
    .eq('id', subtaskId)
    .eq('tasks.user_id', user.id)
    .single()

  if (!subtask) return { error: 'Subtarefa não encontrada' }

  const { error } = await supabase
    .from('subtasks')
    .update({ completed })
    .eq('id', subtaskId)

  if (error) return { error: error.message }

  revalidatePath('/tasks')
  revalidatePath(`/tasks/${subtask.task_id}`)

  return {}
}
