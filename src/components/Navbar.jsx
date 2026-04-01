import { NavLink } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav>
      <NavLink className="nav-logo" to="/">1V1</NavLink>
      <ul className="nav-links">
        <li><NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>Ana Sayfa</NavLink></li>
        <li><NavLink to="/yayincilar" className={({ isActive }) => isActive ? 'active' : ''}>Yayıncılar</NavLink></li>
        <li><NavLink to="/kurallar" className={({ isActive }) => isActive ? 'active' : ''}>Kurallar</NavLink></li>
        <li><NavLink to="/maclar" className={({ isActive }) => isActive ? 'active' : ''}>Maçlar</NavLink></li>
        <li><NavLink to="/kayit" className={({ isActive }) => isActive ? 'active' : ''}>Kayıt</NavLink></li>
      </ul>
    </nav>
  )
}
