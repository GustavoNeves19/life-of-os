import type { Metadata, Viewport } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'
import { BottomNav } from '@/components/layout/BottomNav'
import { PWARegister } from '@/components/layout/PWARegister'
import { QuickAddFAB } from '@/components/layout/QuickAddFAB'
import { getCurrentUser } from '@/lib/auth'

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

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} bg-zinc-50 font-sans antialiased text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50`}
      >
        <PWARegister />

        <div className="relative min-h-screen max-w-lg mx-auto">
          <main className={`px-4 pt-4 ${isAuthed ? 'pb-24' : 'pb-4'}`}>{children}</main>

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
