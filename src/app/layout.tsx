import type { Metadata, Viewport } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'
import { BottomNav } from '@/components/layout/BottomNav'
import { QuickAddFAB } from '@/components/layout/QuickAddFAB'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Life OS',
  description: 'Seu sistema pessoal de organização de vida',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Life OS',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)',  color: '#09090b' },
  ],
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const isAuthed = !!user

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50`}
      >
        <div className="relative min-h-screen max-w-lg mx-auto">
          {/* Main content — padded for bottom nav */}
          <main className={`px-4 pt-4 ${isAuthed ? 'pb-24' : 'pb-4'}`}>
            {children}
          </main>

          {/* Bottom navigation — only when authenticated */}
          {isAuthed && (
            <>
              <BottomNav />
              <QuickAddFAB />
            </>
          )}
        </div>
      </body>
    </html>
  )
}
