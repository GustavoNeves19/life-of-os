'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { FINANCE_LINK_KIND_META } from '@/lib/constants/finance'
import type {
  FinancialEntry,
  FinanceLink,
  FinanceLinkKind,
  FinanceType,
} from '@/types'

function normalizeUrl(url: string) {
  const trimmed = url.trim()
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`

  try {
    return new URL(withProtocol).toString()
  } catch {
    return null
  }
}

function isFinanceLinkKind(value: string): value is FinanceLinkKind {
  return value in FINANCE_LINK_KIND_META
}

export async function getFinances(month?: string): Promise<{
  entries: FinancialEntry[]
  totalIncome: number
  totalExpenses: number
  balance: number
}> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { entries: [], totalIncome: 0, totalExpenses: 0, balance: 0 }
  }

  const now = new Date()
  const targetMonth =
    month ?? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const [year, currentMonth] = targetMonth.split('-')
  const startDate = `${year}-${currentMonth}-01`
  const endDate = new Date(Number(year), Number(currentMonth), 0)
    .toISOString()
    .split('T')[0]

  const { data, error } = await supabase
    .from('financial_entries')
    .select('*')
    .eq('user_id', user.id)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: false })

  if (error) {
    console.error(error)
    return { entries: [], totalIncome: 0, totalExpenses: 0, balance: 0 }
  }

  const entries = (data as FinancialEntry[]) ?? []
  const totalIncome = entries
    .filter((entry) => entry.type === 'income')
    .reduce((sum, entry) => sum + entry.amount, 0)
  const totalExpenses = entries
    .filter((entry) => entry.type === 'expense')
    .reduce((sum, entry) => sum + entry.amount, 0)

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
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Nao autenticado' }

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
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Nao autenticado' }

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

export async function getFinanceLinks(): Promise<FinanceLink[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return []

  const { data, error } = await supabase
    .from('finance_links')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error(error)
    return []
  }

  return (data as FinanceLink[]) ?? []
}

export async function createFinanceLink(formData: {
  title: string
  url: string
  provider?: string
  kind: FinanceLinkKind
  notes?: string
}): Promise<{ error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Nao autenticado' }
  if (!isFinanceLinkKind(formData.kind)) return { error: 'Tipo de acesso invalido' }

  const normalizedUrl = normalizeUrl(formData.url)
  if (!normalizedUrl) return { error: 'Informe uma URL valida' }

  const { error } = await supabase.from('finance_links').insert({
    user_id: user.id,
    title: formData.title.trim(),
    url: normalizedUrl,
    provider: formData.provider?.trim() || null,
    kind: formData.kind,
    notes: formData.notes?.trim() || null,
  })

  if (error) return { error: error.message }

  revalidatePath('/finances')
  return {}
}

export async function deleteFinanceLink(id: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Nao autenticado' }

  const { error } = await supabase
    .from('finance_links')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/finances')
  return {}
}
