import { createContext, useContext, useEffect, useState } from 'react'
import { getSetting, setSetting, subscribeToTable } from '../lib/supabase'

const ThemeContext = createContext(null)

const THEMES = ['pax', 'raku', 'redjangu']

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState('pax')

  // Apply theme class to <html>
  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('raku', 'redjangu')
    if (theme === 'raku') root.classList.add('raku')
    else if (theme === 'redjangu') root.classList.add('redjangu')
  }, [theme])

  // Load active theme from Supabase on mount + subscribe to changes
  useEffect(() => {
    async function load() {
      const val = await getSetting('global', 'active_theme')
      if (val && THEMES.includes(val)) setThemeState(val)
    }
    load()
    const unsub = subscribeToTable('settings', () => load())
    return unsub
  }, [])

  // setTheme: save to Supabase (admin calls this), everyone syncs via realtime
  async function setTheme(val) {
    if (!THEMES.includes(val)) return
    setThemeState(val)
    await setSetting('global', 'active_theme', val)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
