'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { FinancialEntry, FinanceType } from '@/types'

export async function getFinances(month?: string): Promise<{
  entries: FinancialEntry[]
  totalIncome: number
  totalExpenses: number
  balance: number
}> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { entries: [], totalIncome: 0, totalExpenses: 0, balance: 0 }

  const now = new Date()
  const targetMonth = month ?? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const [year, m] = targetMonth.split('-')
  const startDate = `${year}-${m}-01`
  const endDate = new Date(Number(year), Number(m), 0).toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('financial_entries')
    .select('*')
    .eq('user_id', user.id)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: false })

  if (error) return { entries: [], totalIncome: 0, totalExpenses: 0, balance: 0 }

  const entries = (data as FinancialEntry[]) ?? []
  const totalIncome = entries
    .filter(e => e.type === 'income')
    .reduce((sum, e) => sum + e.amount, 0)
  const totalExpenses = entries
    .filter(e => e.type === 'expense')
    .reduce((sum, e) => sum + e.amount, 0)

  return { entries, totalIncome, totalExpenses, balance: totalIncome - totalExpenses }
}

export async function createFinancialEntry(formData: {
  type: FinanceType
  amount: number
  category: string
  description?: string
  date: string
}): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const { error } = await supabase.from('financial_entries').insert({
    ...formData,
    user_id: user.id,
  })

  if (error) return { error: error.message }

  revalidatePath('/finances')
  revalidatePath('/dashboard')
  return {}
}

export async function deleteFinancialEntry(id: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const { error } = await supabase
    .from('financial_entries')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/finances')
  revalidatePath('/dashboard')
  return {}
}
