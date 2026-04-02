import { useState } from 'react'
import { addRegistration, getRegistrations } from '../lib/supabase'
import styles from './Kayit.module.css'

export default function Kayit() {
  const [kickNick, setKickNick] = useState('')
  const [lolNick, setLolNick] = useState('')
  const [kickErr, setKickErr] = useState('')
  const [lolErr, setLolErr] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const canSubmit = kickNick.trim() && lolNick.trim()

  async function handleSubmit(e) {
    e.preventDefault()
    setKickErr('')
    setLolErr('')

    const kick = kickNick.trim()
    const lol = lolNick.trim()

    if (!kick) { setKickErr('Bu alan zorunludur.'); return }
    if (!lol)  { setLolErr('Bu alan zorunludur.'); return }

    // LoL nick format: OyuncuAdı#TAG
    const lolParts = lol.split('#')
    if (lolParts.length !== 2 || !lolParts[0].trim() || !lolParts[1].trim()) {
      setLolErr('❌ Geçersiz format. Örnek: OyuncuAdı#TR1'); return
    }

    setLoading(true)

    // Duplicate check
    const existing = await getRegistrations()
    const dupKick = existing.some(r => r.kick_nick.toLowerCase() === kick.toLowerCase())
    const dupLol  = existing.some(r => r.lol_nick.toLowerCase()  === lol.toLowerCase())

    if (dupKick) { setKickErr('❌ Bu Kick nick zaten kayıtlı.'); setLoading(false); return }
    if (dupLol)  { setLolErr('❌ Bu LoL nick zaten kayıtlı.');  setLoading(false); return }

    const { error } = await addRegistration(kick, lol)
    setLoading(false)

    if (error) {
      setKickErr('❌ Kayıt sırasında hata oluştu. Tekrar dene.')
      return
    }

    setKickNick('')
    setLolNick('')
    setSuccess(true)
    setTimeout(() => setSuccess(false), 4000)
  }

  return (
    <div className={styles.page}>
      <div className={`${styles.pageHeader} fade-up`}>
        <span className={styles.pageTag}>Turnuvaya Katıl</span>
        <h1>Kayıt <span>Formu</span></h1>
      </div>

      <div className={`${styles.formCard} fade-up-1`}>
        <form onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label>Kick Nick</label>
            <input
              className="ipt"
              type="text"
              placeholder="Kick kullanıcı adın"
              value={kickNick}
              onChange={e => setKickNick(e.target.value)}
            />
            {kickErr && <div className={styles.err}>{kickErr}</div>}
          </div>

          <div className={styles.field}>
            <label>League of Legends Nick</label>
            <input
              className="ipt"
              type="text"
              placeholder="OyuncuAdı#TR1"
              value={lolNick}
              onChange={e => setLolNick(e.target.value)}
            />
            {lolErr && <div className={styles.err}>{lolErr}</div>}
          </div>

          <button
            className={styles.submitBtn}
            type="submit"
            disabled={!canSubmit || loading}
          >
            {loading ? 'Kaydediliyor...' : 'Kaydı Tamamla'}
          </button>
        </form>

        {success && (
          <div className={styles.successBox}>
            <p>✅ Kaydın alındı! Turnuva günü takipte kal.</p>
          </div>
        )}
      </div>
    </div>
  )
}
