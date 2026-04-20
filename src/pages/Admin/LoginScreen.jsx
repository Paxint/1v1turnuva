import { useState } from 'react'
import styles from './LoginScreen.module.css'

export default function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    const ok = await onLogin(username, password)
    setLoading(false)
    if (!ok) {
      setError(true)
      setPassword('')
      setTimeout(() => setError(false), 3000)
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.box}>
        <div className={styles.lockIcon}>🔒</div>
        <h2>Admin Girişi</h2>
        <p>Bu sayfa yalnızca yetkili kullanıcılar içindir.</p>
        <form onSubmit={handleSubmit}>
          <input
            className={`${styles.ipt} ${styles.mb}`}
            type="text"
            placeholder="Kullanıcı adı"
            value={username}
            onChange={e => setUsername(e.target.value)}
            autoFocus
            autoComplete="username"
          />
          <input
            className={`${styles.ipt} ${styles.mb}`}
            type="password"
            placeholder="Şifre"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete="current-password"
          />
          <button className={styles.loginBtn} type="submit" disabled={loading}>
            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>
        {error && <div className={styles.errMsg}>❌ Kullanıcı adı veya şifre hatalı.</div>}
      </div>
    </div>
  )
}
