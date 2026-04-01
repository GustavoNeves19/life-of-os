'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, CheckSquare, Grid2X2, Wallet, Target } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Início' },
  { href: '/tasks',     icon: CheckSquare,     label: 'Tarefas' },
  { href: '/areas',     icon: Grid2X2,         label: 'Áreas'   },
  { href: '/finances',  icon: Wallet,          label: 'Finanças' },
  { href: '/goals',     icon: Target,          label: 'Metas'   },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-t border-zinc-100 dark:border-zinc-800 pb-safe">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200',
                active
                  ? 'text-violet-600 dark:text-violet-400'
                  : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300'
              )}
            >
              <Icon
                size={22}
                strokeWidth={active ? 2.5 : 1.8}
                className={cn(
                  'transition-transform duration-200',
                  active && 'scale-110'
                )}
              />
              <span className={cn(
                'text-[10px] font-medium tracking-wide transition-all',
                active ? 'opacity-100' : 'opacity-60'
              )}>
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
