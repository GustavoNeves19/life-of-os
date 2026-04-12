import type { Metadata, Viewport } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'
import { BottomNav } from '@/components/layout/BottomNav'
import { PWARegister } from '@/components/layout/PWARegister'
import { QuickAddFAB } from '@/components/layout/QuickAddFAB'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { getAreas } from '@/lib/actions/goals-areas'
import { getCurrentUser } from '@/lib/auth'
import { THEME_INIT_SCRIPT } from '@/lib/theme'

export const metadata: Metadata = {
  title: 'Life OS',
  description: 'Seu sistema pessoal de organizacao de vida',
  manifest: '/manifest.json',
  applicationName: 'Life OS',
  icons: {
    icon: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Life OS',
  },
  formatDetection: {
    telephone: false,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#09090b' },
  ],
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()
  const isAuthed = Boolean(user)
  const areas = isAuthed ? await getAreas() : []

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} bg-zinc-50 font-sans antialiased text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50`}
      >
        <PWARegister />

        <div className="relative min-h-screen max-w-lg mx-auto">
          <div className="flex justify-end px-4 pb-2 pt-4 pt-safe">
            <ThemeToggle />
          </div>

          <main className={`px-4 ${isAuthed ? 'pb-24' : 'pb-4'}`}>{children}</main>

          {isAuthed && (
            <>
              <BottomNav />
              <QuickAddFAB areas={areas} />
            </>
          )}
        </div>
      </body>
    </html>
  )
}
