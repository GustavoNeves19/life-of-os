export type ThemeMode = 'light' | 'dark'

export const THEME_STORAGE_KEY = 'life-os-theme'

export const THEME_INIT_SCRIPT = `
  (() => {
    try {
      const storedTheme = localStorage.getItem('${THEME_STORAGE_KEY}')
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      const theme =
        storedTheme === 'light' || storedTheme === 'dark'
          ? storedTheme
          : prefersDark
            ? 'dark'
            : 'light'

      const root = document.documentElement
      root.classList.toggle('dark', theme === 'dark')
      root.style.colorScheme = theme
    } catch (error) {
      console.error('Theme init failed', error)
    }
  })();
`
