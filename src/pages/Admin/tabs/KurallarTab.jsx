import { useEffect, useState } from 'react'
import { getRules, saveRules } from '../../../lib/supabase'
import styles from './Tabs.module.css'

const DEFAULT_RULES = [
  { title: 'Katılım Koşulları',            items: ['Bu alana kural içeriğini ekleyin.', 'Bu alana kural içeriğini ekleyin.', 'Bu alana kural içeriğini ekleyin.'] },
  { title: 'Maç Formatı',                  items: ['Bu alana kural içeriğini ekleyin.', 'Bu alana kural içeriğini ekleyin.', 'Bu alana kural içeriğini ekleyin.'] },
  { title: 'Ödül Dağılımı',                items: ['Birinci: 3625 RP', 'İkinci: 2105 RP', 'Üçüncü: 1005 RP'] },
  { title: 'Yasaklı Davranışlar',          items: ['Bu alana kural içeriğini ekleyin.', 'Bu alana kural içeriğini ekleyin.'] },
  { title: 'Teknik Sorunlar & Gecikmeler', items: ['Bu alana kural içeriğini ekleyin.', 'Bu alana kural içeriğini ekleyin.'] },
]

export default function KurallarTab({ theme }) {
  const [rules, setRules] = useState(DEFAULT_RULES)
  const [sucMsg, setSucMsg] = useState('')

  useEffect(() => {
    async function load() {
      const rows = await getRules(theme)
      if (rows.length > 0) setRules(rows)
      else setRules(DEFAULT_RULES)
    }
    load()
  }, [theme])

  function updateTitle(i, val) {
    setRules(prev => prev.map((r, idx) => idx === i ? { ...r, title: val } : r))
  }

  function updateItems(i, text) {
    const items = text.split('\n').map(l => l.trim()).filter(Boolean)
    setRules(prev => prev.map((r, idx) => idx === i ? { ...r, items } : r))
  }

  async function handleSave() {
    await saveRules(theme, rules)
    setSucMsg('✅ Kaydedildi!')
    setTimeout(() => setSucMsg(''), 3000)
  }

  return (
    <div className={styles.card}>
      <div className={styles.cardTitle}>📋 Kurallar (Aktif Yayıncı)</div>

      <div className={styles.rulesEditor}>
        {rules.map((rule, i) => (
          <div key={i} className={styles.reBlock}>
            <div className={styles.reHdr}>
              <span>{String(i + 1).padStart(2, '0')}</span>
              <span>Bölüm</span>
            </div>
            <div className={styles.reBody}>
              <input
                className="ipt"
                type="text"
                placeholder="Başlık"
                value={rule.title}
                onChange={e => updateTitle(i, e.target.value)}
                style={{ marginBottom: '0.5rem' }}
              />
              <textarea
                className="ipt"
                placeholder="Her maddeyi ayrı satıra..."
                value={rule.items.join('\n')}
                onChange={e => updateItems(i, e.target.value)}
                style={{ resize: 'vertical', minHeight: 80, lineHeight: 1.6 }}
              />
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '0.8rem' }}>
        <button className={styles.btnGreen} onClick={handleSave}>💾 Kuralları Kaydet</button>
      </div>
      <p className={styles.rulesHint}>Her maddeyi ayrı satıra yaz.</p>
      {sucMsg && <div className={styles.sucMsg}>{sucMsg}</div>}
    </div>
  )
}
