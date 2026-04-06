import { useEffect, useState, useCallback } from 'react'
import { getVisitCounts } from '../../../lib/supabase'
import styles from './LogTab.module.css'

function fmt(dateStr) {
  // "YYYY-MM-DD" → "DD.MM.YYYY"
  const [y, m, d] = dateStr.split('-')
  return `${d}.${m}.${y}`
}

export default function LogTab() {
  const [rows, setRows] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const data = await getVisitCounts()
    setRows(data)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const today = new Date().toISOString().slice(0, 10)
  const todayRow = rows?.find(r => r.date === today)
  const total = rows?.reduce((s, r) => s + r.count, 0) ?? 0

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div className={styles.statCard}>
          <span className={styles.statNum}>{todayRow?.count ?? 0}</span>
          <span className={styles.statLabel}>Bugün</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statNum}>{total}</span>
          <span className={styles.statLabel}>Toplam</span>
        </div>
        <button className={styles.refreshBtn} onClick={load} disabled={loading}>
          {loading ? '...' : '↻ Yenile'}
        </button>
      </div>

      {loading && !rows ? (
        <div className={styles.empty}>Yükleniyor...</div>
      ) : !rows || rows.length === 0 ? (
        <div className={styles.empty}>Henüz ziyaret verisi yok.</div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Tarih</th>
                <th>Unique Ziyaretçi</th>
                <th>Bar</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => {
                const max = Math.max(...rows.map(x => x.count), 1)
                const pct = Math.round((r.count / max) * 100)
                const isToday = r.date === today
                return (
                  <tr key={r.date} className={isToday ? styles.todayRow : ''}>
                    <td className={styles.dateCell}>
                      {fmt(r.date)}
                      {isToday && <span className={styles.todayBadge}>bugün</span>}
                    </td>
                    <td className={styles.countCell}>{r.count}</td>
                    <td className={styles.barCell}>
                      <div className={styles.barBg}>
                        <div
                          className={styles.barFill}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className={styles.note}>
        * IP adresleri saklanmıyor. Ziyaretçiler SHA-256 ile anonimleştirilmiş hash olarak sayılıyor.
      </p>
    </div>
  )
}
