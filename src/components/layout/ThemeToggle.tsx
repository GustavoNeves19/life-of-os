'use client'

import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { cn } from '@/lib/utils'
import { THEME_STORAGE_KEY, type ThemeMode } from '@/lib/theme'

function getCurrentTheme(): ThemeMode {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
}

function applyTheme(theme: ThemeMode) {
  const root = document.documentElement
  root.classList.toggle('dark', theme === 'dark')
  root.style.colorScheme = theme
  localStorage.setItem(THEME_STORAGE_KEY, theme)
}

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const [theme, setTheme] = useState<ThemeMode>('light')

  useEffect(() => {
    setTheme(getCurrentTheme())
    setMounted(true)
  }, [])

  function toggleTheme() {
    const nextTheme = theme === 'dark' ? 'light' : 'dark'
    applyTheme(nextTheme)
    setTheme(nextTheme)
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        'flex h-10 w-10 items-center justify-center rounded-2xl border border-zinc-200 bg-white/90 text-zinc-600 shadow-sm backdrop-blur transition-colors hover:border-zinc-300 hover:text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900/90 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:text-zinc-50',
        !mounted && 'opacity-0'
      )}
      aria-label={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
      title={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
    >
      {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  )
}
