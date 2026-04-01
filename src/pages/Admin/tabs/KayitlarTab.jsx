import { useEffect, useState } from 'react'
import {
  getRegistrations,
  addRegistration,
  deleteRegistration,
  clearRegistrations,
} from '../../../lib/supabase'
import styles from './Tabs.module.css'

export default function KayitlarTab() {
  const [list, setList] = useState([])
  const [addKick, setAddKick] = useState('')
  const [addLol, setAddLol] = useState('')
  const [addSuc, setAddSuc] = useState('')
  const [addErr, setAddErr] = useState('')
  const [exportText, setExportText] = useState('')
  const [copySuc, setCopySuc] = useState(false)

  async function load() {
    const rows = await getRegistrations()
    setList(rows)
  }

  useEffect(() => { load() }, [])

  async function handleAdd() {
    setAddErr(''); setAddSuc('')
    if (!addKick.trim() || !addLol.trim()) {
      setAddErr('❌ Her iki alan da dolu olmalı.')
      setTimeout(() => setAddErr(''), 3000)
      return
    }
    const { error } = await addRegistration(addKick.trim(), addLol.trim())
    if (error) {
      setAddErr('❌ Ekleme hatası.')
      setTimeout(() => setAddErr(''), 3000)
      return
    }
    setAddKick(''); setAddLol('')
    setAddSuc('✅ Eklendi!')
    setTimeout(() => setAddSuc(''), 3000)
    load()
  }

  async function handleDelete(id) {
    await deleteRegistration(id)
    load()
  }

  async function handleClearAll() {
    if (!window.confirm('Tüm kayıtlar silinsin mi?')) return
    await clearRegistrations()
    setExportText('')
    load()
  }

  function exportList(mode) {
    if (!list.length) { alert('Kayıt yok.'); return }
    let txt
    if (mode === 'kick') txt = list.map(r => r.kick_nick).join('\n')
    else if (mode === 'lol') txt = list.map(r => r.lol_nick).join('\n')
    else txt = list.map(r => `${r.kick_nick} | ${r.lol_nick}`).join('\n')
    setExportText(txt)
  }

  function copyExport() {
    navigator.clipboard.writeText(exportText).then(() => {
      setCopySuc(true)
      setTimeout(() => setCopySuc(false), 3000)
    })
  }

  return (
    <>
      {/* Add */}
      <div className={styles.card}>
        <div className={styles.cardTitle}>➕ Manuel Kayıt Ekle</div>
        <div className={styles.kayitAdd}>
          <input className="ipt" type="text" placeholder="Kick nick" value={addKick} onChange={e => setAddKick(e.target.value)} />
          <input className="ipt" type="text" placeholder="LoL nick"  value={addLol}  onChange={e => setAddLol(e.target.value)} />
          <button className={styles.addBtn} onClick={handleAdd}>Ekle</button>
        </div>
        {addSuc && <div className={styles.sucMsg}>{addSuc}</div>}
        {addErr && <div className={styles.errMsg}>{addErr}</div>}
      </div>

      {/* List */}
      <div className={styles.card}>
        <div className={styles.cardTitle}>📋 Kayıtlı Oyuncular</div>
        <div className={styles.kayitCount}>{list.length} kayıt</div>

        <div className={styles.exportRow}>
          <button className={styles.expBtn} onClick={() => exportList('kick')}>📋 Kick Nickler</button>
          <button className={styles.expBtn} onClick={() => exportList('lol')}>📋 LoL Nickler</button>
          <button className={styles.expBtn} onClick={() => exportList('both')}>📋 İkisi Birden</button>
          <button className={`${styles.expBtn} ${styles.expBtnDanger}`} onClick={handleClearAll}>🗑️ Tümünü Sil</button>
        </div>

        <div className={styles.kayitList}>
          {list.length === 0
            ? <div className={styles.emptyMsg}>Henüz kayıt yok.</div>
            : list.map(r => (
              <div key={r.id} className={styles.kayitRow}>
                <span className={styles.kickNick}>{r.kick_nick}</span>
                <span className={styles.lolNick}>{r.lol_nick}</span>
                <button className={styles.delBtn} onClick={() => handleDelete(r.id)}>✕ Sil</button>
              </div>
            ))
          }
        </div>
      </div>

      {/* Export */}
      {exportText && (
        <div className={styles.card}>
          <div className={styles.cardTitle}>📤 Kopyala</div>
          <textarea
            className="ipt"
            value={exportText}
            readOnly
            style={{ minHeight: 140, resize: 'vertical', lineHeight: 1.7 }}
          />
          <div style={{ marginTop: '0.6rem' }}>
            <button className={styles.btnGreen} onClick={copyExport}>📋 Kopyala</button>
          </div>
          {copySuc && <div className={styles.sucMsg}>✅ Kopyalandı!</div>}
        </div>
      )}
    </>
  )
}
