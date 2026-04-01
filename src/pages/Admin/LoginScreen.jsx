import { useState } from 'react'
import styles from './LoginScreen.module.css'

export default function LoginScreen({ onLogin }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    const ok = onLogin(password)
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
            type="password"
            placeholder="Şifre"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoFocus
          />
          <button className={styles.loginBtn} type="submit">Giriş Yap</button>
        </form>
        {error && <div className={styles.errMsg}>❌ Yanlış şifre.</div>}
      </div>
    </div>
  )
}
