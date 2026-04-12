import { cache } from 'react'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'

export const getServerClient = cache(async () => createClient())

export const getCurrentUser = cache(async (): Promise<User | null> => {
  const supabase = await getServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return user
})
