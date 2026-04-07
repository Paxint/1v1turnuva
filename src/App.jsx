import { useEffect, lazy, Suspense } from 'react'
import { Routes, Route, Outlet } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import CursorGlow from './components/CursorGlow'

const Home      = lazy(() => import('./pages/Home'))
const Yayincilar = lazy(() => import('./pages/Yayincilar'))
const Kurallar  = lazy(() => import('./pages/Kurallar'))
const Kayit     = lazy(() => import('./pages/Kayit'))
const Maclar    = lazy(() => import('./pages/Maclar'))
const Cark      = lazy(() => import('./pages/Cark'))
const Admin     = lazy(() => import('./pages/Admin'))

function Layout() {
  return (
    <>
      <div className="grain" aria-hidden />
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
    <Suspense fallback={null}>
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
    </Suspense>
  )
}
