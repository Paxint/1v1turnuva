import { useEffect, useState, useCallback } from 'react'
import { getVisitCounts, getAdminLogs } from '../../../lib/supabase'
import styles from './LogTab.module.css'

function fmt(dateStr) {
  // "YYYY-MM-DD" → "DD.MM.YYYY"
  const [y, m, d] = dateStr.split('-')
  return `${d}.${m}.${y}`
}

function fmtTs(ts) {
  const d = new Date(ts)
  const pad = n => String(n).padStart(2, '0')
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function LogTab() {
  const [rows, setRows] = useState(null)
  const [loading, setLoading] = useState(true)
  const [logs, setLogs] = useState(null)
  const [logsLoading, setLogsLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    setLogsLoading(true)
    const [visitData, logData] = await Promise.all([getVisitCounts(), getAdminLogs(50)])
    setRows(visitData)
    setLogs(logData)
    setLoading(false)
    setLogsLoading(false)
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

      {/* ─── Son Yapılan İşlemler ─── */}
      <div className={styles.actionSection}>
        <div className={styles.actionHeader}>
          <span className={styles.actionTitle}>⚡ Son Yapılan İşlemler</span>
          <span className={styles.actionSub}>son 50 kayıt</span>
        </div>

        {logsLoading ? (
          <div className={styles.empty}>Yükleniyor...</div>
        ) : !logs || logs.length === 0 ? (
          <div className={styles.empty}>Henüz işlem kaydı yok.</div>
        ) : (
          <div className={styles.actionList}>
            {logs.map(log => (
              <div key={log.id} className={styles.actionRow}>
                <span className={styles.actionTime}>{fmtTs(log.created_at)}</span>
                <span className={styles.actionUser}>{log.username}</span>
                <span className={styles.actionText}>{log.action}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
