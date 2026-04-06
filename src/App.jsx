import { useEffect } from 'react'
import { Routes, Route, Outlet } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import CursorGlow from './components/CursorGlow'
import Home from './pages/Home'
import Yayincilar from './pages/Yayincilar'
import Kurallar from './pages/Kurallar'
import Kayit from './pages/Kayit'
import Maclar from './pages/Maclar'
import Cark from './pages/Cark'
import Admin from './pages/Admin'

function Layout() {
  return (
    <>
      <CursorGlow />
      <Navbar />
      <Outlet />
      <Footer />
    </>
  )
}

const VISIT_KEY = 'paxint_visited'

export default function App() {
  useEffect(() => {
    if (sessionStorage.getItem(VISIT_KEY)) return
    sessionStorage.setItem(VISIT_KEY, '1')
    fetch('/api/log-visit', { method: 'POST' }).catch(() => {})
  }, [])

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/yayincilar" element={<Yayincilar />} />
        <Route path="/kurallar" element={<Kurallar />} />
        <Route path="/maclar" element={<Maclar />} />
        <Route path="/kayit" element={<Kayit />} />
        <Route path="/cark" element={<Cark />} />
      </Route>
      <Route path="/admin" element={<Admin />} />
    </Routes>
  )
}
