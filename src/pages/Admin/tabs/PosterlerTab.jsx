import { useEffect, useRef, useState } from 'react'
import { getSetting, setSetting, deleteSetting, uploadImage, logAction } from '../../../lib/supabase'
import styles from './Tabs.module.css'

export default function PosterlerTab({ theme }) {
  const [posterSrc, setPosterSrc] = useState(null)
  const [imgError, setImgError] = useState(false)
  const [urlInput, setUrlInput] = useState('')
  const [sucMsg, setSucMsg] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const zoneRef = useRef(null)

  useEffect(() => {
    async function load() {
      const p = await getSetting(theme, 'poster_url')
      setImgError(false)
      setPosterSrc(p || null)
    }
    load()
  }, [theme])

  async function savePoster(src) {
    await setSetting(theme, 'poster_url', src)
    logAction(`Poster güncellendi (${theme})`)
    setImgError(false)
    setPosterSrc(src)
    setSucMsg('✅ Kaydedildi!')
    setTimeout(() => setSucMsg(''), 3000)
  }

  const [uploading, setUploading] = useState(false)

  async function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) return
    setUploading(true)
    try {
      const ext = file.name.split('.').pop() || 'jpg'
      const publicUrl = await uploadImage(`posters/${theme}_${Date.now()}.${ext}`, file)
      await savePoster(publicUrl)
    } catch (err) {
      setSucMsg('❌ Yükleme hatası: ' + err.message)
      setTimeout(() => setSucMsg(''), 4000)
    } finally {
      setUploading(false)
    }
  }

  async function resetPoster() {
    if (!window.confirm('Poster sıfırlansın mı?')) return
    await deleteSetting(theme, 'poster_url')
    logAction(`Poster sıfırlandı (${theme})`)
    setPosterSrc('/poster.png')
    setSucMsg('✅ Sıfırlandı!')
    setTimeout(() => setSucMsg(''), 3000)
  }

  return (
    <div className={styles.card}>
      <div className={styles.cardTitle}>🖼️ Anasayfa Posteri (Aktif Yayıncı)</div>

      <div className={styles.previewWrap}>
        {posterSrc && !imgError ? (
          <img
            key={posterSrc}
            src={posterSrc}
            alt="Poster Önizleme"
            style={{ width: '100%', display: 'block' }}
            onError={() => setImgError(true)}
          />
        ) : (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'rgba(212,245,192,0.3)', fontSize: '0.85rem' }}>
            {posterSrc ? '⚠️ Görsel yüklenemedi' : '📷 Henüz poster yüklenmedi'}
          </div>
        )}
      </div>

      {/* File drop zone */}
      <div
        ref={zoneRef}
        className={`${styles.uploadZone} ${dragOver ? styles.dragOver : ''}`}
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]) }}
        onClick={() => zoneRef.current?.querySelector('input')?.click()}
      >
        <input
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={e => handleFile(e.target.files[0])}
        />
        <div className={styles.uzIcon}>📁</div>
        <p>{uploading ? '⏳ Yükleniyor...' : <>Tıkla veya sürükle — <strong>PNG, JPG, WEBP</strong></>}</p>
      </div>

      <div className={styles.orDiv}>VEYA</div>

      <div className={styles.urlRow}>
        <input
          className="ipt"
          type="text"
          placeholder="https://... görsel URL"
          value={urlInput}
          onChange={e => setUrlInput(e.target.value)}
        />
        <button
          className={styles.applyBtn}
          onClick={() => { if (urlInput.trim()) { savePoster(urlInput.trim()); setUrlInput('') } }}
        >
          Uygula
        </button>
      </div>

      <div style={{ marginTop: '0.8rem' }}>
        <button className={styles.btnDanger} onClick={resetPoster}>🗑️ Varsayılan Görsele Dön</button>
      </div>

      {sucMsg && <div className={styles.sucMsg}>{sucMsg}</div>}
    </div>
  )
}
