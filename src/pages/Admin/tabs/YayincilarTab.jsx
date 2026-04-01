import { useEffect, useState } from 'react'
import { getBroadcasters, upsertBroadcaster } from '../../../lib/supabase'
import styles from './Tabs.module.css'

const DEFAULT_NAMES = ['Paxint', 'Rakuexe27', 'Redjangu']

function compressImage(dataUrl) {
  return new Promise(resolve => {
    const img = new Image()
    img.onload = () => {
      const MAX = 480
      let w = img.width, h = img.height
      if (w > MAX) { h = Math.round(h * MAX / w); w = MAX }
      if (h > MAX * 1.5) { w = Math.round(w * (MAX * 1.5) / h); h = Math.round(MAX * 1.5) }
      const canvas = document.createElement('canvas')
      canvas.width = w; canvas.height = h
      canvas.getContext('2d').drawImage(img, 0, 0, w, h)
      resolve(canvas.toDataURL('image/jpeg', 0.75))
    }
    img.src = dataUrl
  })
}

export default function YayincilarTab({ theme }) {
  const [yayincilar, setYayincilar] = useState(
    DEFAULT_NAMES.map((name, i) => ({ name, subtitle: 'Yayıncı', image_url: '', sort_order: i }))
  )
  const [sucMsg, setSucMsg] = useState('')
  const [errMsg, setErrMsg] = useState('')

  useEffect(() => {
    async function load() {
      const rows = await getBroadcasters(theme)
      if (rows.length > 0) {
        setYayincilar(rows)
      } else {
        setYayincilar(DEFAULT_NAMES.map((name, i) => ({ name, subtitle: 'Yayıncı', image_url: '', sort_order: i })))
      }
    }
    load()
  }, [theme])

  function update(index, field, value) {
    setYayincilar(prev => prev.map((y, i) => i === index ? { ...y, [field]: value } : y))
  }

  async function handleFile(index, file) {
    if (!file) return
    const reader = new FileReader()
    reader.onload = async e => {
      const compressed = await compressImage(e.target.result)
      update(index, 'image_url', compressed)
    }
    reader.readAsDataURL(file)
  }

  async function save() {
    setErrMsg('')
    try {
      await Promise.all(
        yayincilar.map(y =>
          upsertBroadcaster({ broadcaster_key: theme, name: y.name, subtitle: y.subtitle, image_url: y.image_url, sort_order: y.sort_order })
        )
      )
      setSucMsg('✅ Kaydedildi!')
      setTimeout(() => setSucMsg(''), 3000)
    } catch {
      setErrMsg('❌ Kayıt hatası. Görsel çok büyük olabilir.')
      setTimeout(() => setErrMsg(''), 4000)
    }
  }

  return (
    <div className={styles.card}>
      <div className={styles.cardTitle}>🎮 Yayıncılar Sayfası (Aktif Yayıncı)</div>

      <div className={styles.yayinciGrid}>
        {yayincilar.map((y, i) => (
          <div key={i} className={styles.yc}>
            <div className={styles.ycNum}>{i + 1}</div>

            <label className={styles.ycUpload}>
              {y.image_url
                ? <img src={y.image_url} alt={y.name} className={styles.ycImg} />
                : <div className={styles.ycPlaceholder}>🎮</div>
              }
              <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={e => handleFile(i, e.target.files[0])}
              />
            </label>

            <div className={styles.ycBtn} onClick={e => e.currentTarget.previousSibling?.querySelector('input')?.click?.()}>
              📁 Fotoğraf Seç
            </div>

            <input
              className="ipt"
              type="text"
              placeholder="Yayıncı adı"
              value={y.name}
              onChange={e => update(i, 'name', e.target.value)}
            />
            <input
              className="ipt"
              type="text"
              placeholder="Unvan"
              value={y.subtitle}
              onChange={e => update(i, 'subtitle', e.target.value)}
              style={{ marginTop: '0.4rem' }}
            />
          </div>
        ))}
      </div>

      <div style={{ marginTop: '1rem' }}>
        <button className={styles.btnGreen} onClick={save}>💾 Yayıncıları Kaydet</button>
      </div>
      {sucMsg && <div className={styles.sucMsg}>{sucMsg}</div>}
      {errMsg && <div className={styles.errMsg}>{errMsg}</div>}
    </div>
  )
}
