import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext(null)

const THEMES = ['pax', 'raku', 'redjangu']

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(
    () => localStorage.getItem('paxint_theme') || 'pax'
  )

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('raku', 'redjangu')
    if (theme === 'raku') root.classList.add('raku')
    else if (theme === 'redjangu') root.classList.add('redjangu')
    localStorage.setItem('paxint_theme', theme)
  }, [theme])

  function setTheme(val) {
    if (THEMES.includes(val)) setThemeState(val)
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
