import { useEffect, useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import { getRules } from '../lib/supabase'
import styles from './Kurallar.module.css'

const DEFAULT_RULES = [
  { title: 'Katılım Koşulları',            items: ['Bu alana kural içeriğini ekleyin.', 'Bu alana kural içeriğini ekleyin.', 'Bu alana kural içeriğini ekleyin.'] },
  { title: 'Maç Formatı',                  items: ['Bu alana kural içeriğini ekleyin.', 'Bu alana kural içeriğini ekleyin.', 'Bu alana kural içeriğini ekleyin.'] },
  { title: 'Ödül Dağılımı',                items: ['Birinci: 3625 RP', 'İkinci: 2105 RP', 'Üçüncü: 1005 RP'] },
  { title: 'Yasaklı Davranışlar',          items: ['Bu alana kural içeriğini ekleyin.', 'Bu alana kural içeriğini ekleyin.'] },
  { title: 'Teknik Sorunlar & Gecikmeler', items: ['Bu alana kural içeriğini ekleyin.', 'Bu alana kural içeriğini ekleyin.'] },
]

function RuleSection({ rule, index, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className={`${styles.ruleSection} ${open ? styles.open : ''}`}>
      <div className={styles.ruleHeader} onClick={() => setOpen(o => !o)}>
        <span className={styles.ruleNumber}>{String(index + 1).padStart(2, '0')}</span>
        <span className={styles.ruleTitle}>{rule.title}</span>
        <span className={styles.ruleArrow}>▾</span>
      </div>
      <div className={styles.ruleBody}>
        <ul>
          {rule.items.map((item, i) => <li key={i}>{item}</li>)}
        </ul>
      </div>
    </div>
  )
}

export default function Kurallar() {
  const { theme } = useTheme()
  const [rules, setRules] = useState(DEFAULT_RULES)

  useEffect(() => {
    async function load() {
      const rows = await getRules(theme)
      if (rows.length > 0) setRules(rows)
      else setRules(DEFAULT_RULES)
    }
    load()
  }, [theme])

  return (
    <div className={styles.page}>
      <div className={`${styles.pageHeader} fade-up`}>
        <span className={styles.pageTag}>Turnuva Bilgileri</span>
        <h1>Turnuva <span>Kuralları</span></h1>
        <p className={styles.pageSub}>
          Aşağıdaki kurallara uymayan oyuncular turnuvadan diskalifiye edilebilir.
        </p>
      </div>

      <div className={styles.rulesContainer}>
        {rules.map((rule, i) => (
          <RuleSection key={i} rule={rule} index={i} defaultOpen={i === 0} />
        ))}
      </div>

      <div className={`${styles.highlightBox} fade-up-3`}>
        <span className={styles.icon}>⚠️</span>
        <p>
          Sorularınız için yayıncıyı Kick üzerinden takip edin ve yayında sorularınızı iletebilirsiniz.
        </p>
      </div>
    </div>
  )
}
