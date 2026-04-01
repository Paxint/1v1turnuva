import { Routes, Route, Outlet } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Yayincilar from './pages/Yayincilar'
import Kurallar from './pages/Kurallar'
import Kayit from './pages/Kayit'
import Admin from './pages/Admin'

function Layout() {
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
    </>
  )
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/yayincilar" element={<Yayincilar />} />
        <Route path="/kurallar" element={<Kurallar />} />
        <Route path="/kayit" element={<Kayit />} />
      </Route>
      <Route path="/admin" element={<Admin />} />
    </Routes>
  )
}
