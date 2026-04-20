import { useEffect, useState } from 'react'
import { getRules, saveRules, logAction } from '../../../lib/supabase'
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
  // Raw textarea values — not trimmed, so typing spaces works
  const [rawTexts, setRawTexts] = useState(() => DEFAULT_RULES.map(r => r.items.join('\n')))
  const [sucMsg, setSucMsg] = useState('')

  useEffect(() => {
    async function load() {
      const rows = await getRules(theme)
      const data = rows.length > 0 ? rows : DEFAULT_RULES
      setRules(data)
      setRawTexts(data.map(r => r.items.join('\n')))
    }
    load()
  }, [theme])

  function updateTitle(i, val) {
    setRules(prev => prev.map((r, idx) => idx === i ? { ...r, title: val } : r))
  }

  function updateItems(i, text) {
    setRawTexts(prev => prev.map((t, idx) => idx === i ? text : t))
  }

  async function handleSave() {
    // Trim and filter only on save
    const finalRules = rules.map((r, i) => ({
      ...r,
      items: (rawTexts[i] || '').split('\n').map(l => l.trim()).filter(Boolean),
    }))
    await saveRules(theme, finalRules)
    logAction(`Kurallar kaydedildi (${theme})`)
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
                value={rawTexts[i] ?? rule.items.join('\n')}
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
