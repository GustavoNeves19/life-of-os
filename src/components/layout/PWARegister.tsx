'use client'

import { useEffect } from 'react'

export function PWARegister() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    const isSecureRuntime =
      window.location.protocol === 'https:' || window.location.hostname === 'localhost'

    if (!isSecureRuntime) return

    const register = async () => {
      try {
        await navigator.serviceWorker.register('/sw.js', { scope: '/' })
      } catch (error) {
        console.error('PWA registration failed', error)
      }
    }

    register()
  }, [])

  return null
}
