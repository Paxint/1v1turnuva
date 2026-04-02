import { useState, useEffect, useRef } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { getSetting } from '../lib/supabase'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [carkEnabled, setCarkEnabled] = useState(false)
  const location = useLocation()
  const navRef = useRef(null)

  useEffect(() => {
    getSetting('global', 'cark_enabled').then(v => setCarkEnabled(v === 'true'))
  }, [])

  useEffect(() => setOpen(false), [location])

  useEffect(() => {
    if (!open) return
    function handler(e) {
      if (navRef.current && !navRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const close = () => setOpen(false)

  return (
    <nav ref={navRef}>
      <NavLink className="nav-logo" to="/">1V1</NavLink>

      <button
        className={`nav-hamburger${open ? ' nav-hamburger--open' : ''}`}
        onClick={() => setOpen(o => !o)}
        aria-label="Menü"
        aria-expanded={open}
      >
        <span /><span /><span />
      </button>

      <ul className={`nav-links${open ? ' nav-open' : ''}`}>
        <li><NavLink to="/" end onClick={close} className={({ isActive }) => isActive ? 'active' : ''}>Ana Sayfa</NavLink></li>
        <li><NavLink to="/yayincilar" onClick={close} className={({ isActive }) => isActive ? 'active' : ''}>Yayıncılar</NavLink></li>
        <li><NavLink to="/kurallar" onClick={close} className={({ isActive }) => isActive ? 'active' : ''}>Kurallar</NavLink></li>
        <li><NavLink to="/maclar" onClick={close} className={({ isActive }) => isActive ? 'active' : ''}>Maçlar</NavLink></li>
        <li><NavLink to="/kayit" onClick={close} className={({ isActive }) => isActive ? 'active' : ''}>Kayıt</NavLink></li>
        {carkEnabled && (
          <li><NavLink to="/cark" onClick={close} className={({ isActive }) => isActive ? 'active' : ''}>Çark</NavLink></li>
        )}
      </ul>
    </nav>
  )
}
