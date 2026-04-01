import { useEffect, useState } from 'react'
import { getBroadcasters, saveBroadcasters, uploadImage } from '../../../lib/supabase'
import styles from './Tabs.module.css'

const EMPTY_BROADCASTER = { name: '', subtitle: 'Yayıncı', image_url: '', effect: 'none' }

const EFFECT_OPTIONS = [
  { value: 'none',      label: '⭕ Efekt Yok'   },
  { value: 'fire',      label: '🔥 Ateş'        },
  { value: 'water',     label: '💧 Su'           },
  { value: 'grass',     label: '🌿 Çimen'        },
  { value: 'ice',       label: '❄️ Buz'          },
  { value: 'lightning', label: '⚡ Elektrik'     },
  { value: 'fighting',  label: '👊 Dövüş'        },
  { value: 'poison',    label: '☠️ Zehir'        },
  { value: 'ground',    label: '🌍 Toprak'       },
  { value: 'flying',    label: '🌀 Uçuş'         },
  { value: 'psychic',   label: '🔮 Psişik'       },
  { value: 'bug',       label: '🐛 Böcek'        },
  { value: 'rock',      label: '🪨 Kaya'         },
  { value: 'ghost',     label: '👻 Hayalet'      },
  { value: 'dragon',    label: '🐉 Ejderha'      },
  { value: 'dark',      label: '🌑 Karanlık'     },
  { value: 'steel',     label: '⚙️ Çelik'        },
  { value: 'fairy',     label: '🌸 Peri'         },
  { value: 'normal',    label: '⬜ Normal'        },
  { value: 'blood',     label: '🩸 Kan'          },
]

export default function YayincilarTab({ theme }) {
  const [yayincilar, setYayincilar] = useState([])
  const [sucMsg, setSucMsg] = useState('')
  const [errMsg, setErrMsg] = useState('')
  const [uploading, setUploading] = useState(null)

  useEffect(() => {
    async function load() {
      const rows = await getBroadcasters(theme)
      if (rows.length > 0) {
        setYayincilar(rows.map(r => ({ name: r.name, subtitle: r.subtitle, image_url: r.image_url, effect: r.effect || 'none' })))
      } else {
        setYayincilar([
          { name: 'Paxint',    subtitle: 'Yayıncı', image_url: '', effect: 'none' },
          { name: 'Rakuexe27', subtitle: 'Yayıncı', image_url: '', effect: 'none' },
          { name: 'Redjangu',  subtitle: 'Yayıncı', image_url: '', effect: 'none' },
        ])
      }
    }
    load()
  }, [theme])

  function update(index, field, value) {
    setYayincilar(prev => prev.map((y, i) => i === index ? { ...y, [field]: value } : y))
  }

  function addCard() {
    setYayincilar(prev => [...prev, { ...EMPTY_BROADCASTER }])
  }

  function removeCard(index) {
    if (yayincilar.length <= 1) return
    setYayincilar(prev => prev.filter((_, i) => i !== index))
  }

  async function handleFile(index, file) {
    if (!file) return
    setUploading(index)
    try {
      const ext = file.name.split('.').pop() || 'jpg'
      const publicUrl = await uploadImage(`broadcasters/${theme}_${index}.${ext}`, file)
      update(index, 'image_url', publicUrl)
    } catch (err) {
      setErrMsg('❌ Yükleme hatası: ' + err.message)
      setTimeout(() => setErrMsg(''), 4000)
    } finally {
      setUploading(null)
    }
  }

  async function save() {
    setErrMsg('')
    try {
      await saveBroadcasters(theme, yayincilar)
      setSucMsg('✅ Kaydedildi!')
      setTimeout(() => setSucMsg(''), 3000)
    } catch {
      setErrMsg('❌ Kayıt hatası.')
      setTimeout(() => setErrMsg(''), 4000)
    }
  }

  return (
    <div className={styles.card}>
      <div className={styles.cardTitle}>🎮 Yayıncılar Sayfası (Aktif Yayıncı)</div>

      <div className={styles.yayinciGrid}>
        {yayincilar.map((y, i) => (
          <div key={i} className={styles.yc}>
            {/* Numara + Sil butonu */}
            <div className={styles.ycHeader}>
              <span className={styles.ycNum}>{i + 1}</span>
              <button
                className={styles.ycRemoveBtn}
                onClick={() => removeCard(i)}
                title="Kartı sil"
                disabled={yayincilar.length <= 1}
              >✕</button>
            </div>

            {/* Görsel yükleme */}
            <label className={styles.ycUpload}>
              {uploading === i
                ? <div className={styles.ycPlaceholder}>⏳</div>
                : y.image_url
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

            <div className={styles.ycBtn}
              onClick={e => e.currentTarget.previousSibling?.querySelector('input')?.click?.()}>
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
            <select
              className={styles.effectSelect}
              value={y.effect || 'none'}
              onChange={e => update(i, 'effect', e.target.value)}
            >
              {EFFECT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {/* + Kart Ekle */}
      <button className={styles.addCardBtn} onClick={addCard}>
        ＋ Yayıncı Ekle
      </button>

      <div style={{ marginTop: '1rem' }}>
        <button className={styles.btnGreen} onClick={save}>💾 Yayıncıları Kaydet</button>
      </div>

      {sucMsg && <div className={styles.sucMsg}>{sucMsg}</div>}
      {errMsg && <div className={styles.errMsg}>{errMsg}</div>}
    </div>
  )
}
