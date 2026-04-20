import { useEffect, useState } from 'react'
import { getAdminUsers, createAdminUser, updateAdminUserPassword, deleteAdminUser, logAction } from '../../../lib/supabase'
import styles from './KullanicilarTab.module.css'
import tabStyles from './Tabs.module.css'

const ROLE_LABELS = {
  superadmin: '👑 Süper Admin',
  yayinci:    '🎮 Yayıncı',
  moderator:  '🛡️ Moderatör',
}

export default function KullanicilarTab({ role }) {
  const isSA = role === 'superadmin'
  const [users, setUsers]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [msg, setMsg]           = useState('')

  // Yeni kullanıcı formu
  const [newUsername, setNewUsername] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newRole, setNewRole]         = useState('moderator')
  const [creating, setCreating]       = useState(false)

  // Şifre değiştirme
  const [editId, setEditId]       = useState(null)
  const [editPassword, setEditPassword] = useState('')
  const [saving, setSaving]       = useState(false)

  async function load() {
    setLoading(true)
    setUsers(await getAdminUsers())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function flash(text) {
    setMsg(text)
    setTimeout(() => setMsg(''), 2500)
  }

  async function handleCreate(e) {
    e.preventDefault()
    if (!newUsername.trim() || !newPassword.trim()) return
    setCreating(true)
    const { error } = await createAdminUser(newUsername.trim(), newPassword, newRole)
    setCreating(false)
    if (error) { flash('❌ Hata: ' + (error.message ?? error)); return }
    setNewUsername('')
    setNewPassword('')
    setNewRole('moderator')
    logAction(`Kullanıcı oluşturuldu: ${newUsername.trim()} (${newRole})`)
    flash('✅ Kullanıcı oluşturuldu')
    load()
  }

  async function handlePasswordSave(id) {
    if (!editPassword.trim()) return
    setSaving(true)
    const err = await updateAdminUserPassword(id, editPassword)
    setSaving(false)
    if (err) { flash('❌ Hata: ' + (err.message ?? err)); return }
    const editedUser = users.find(u => u.id === id)
    logAction(`Şifre değiştirildi: ${editedUser?.username ?? id}`)
    setEditId(null)
    setEditPassword('')
    flash('✅ Şifre güncellendi')
  }

  async function handleDelete(id, uname) {
    if (!window.confirm(`"${uname}" kullanıcısı silinsin mi?`)) return
    await deleteAdminUser(id)
    logAction(`Kullanıcı silindi: ${uname}`)
    flash('✅ Kullanıcı silindi')
    load()
  }

  return (
    <div className={styles.wrap}>

      {/* Yeni kullanıcı oluştur — sadece superadmin */}
      {isSA && <div className={styles.section}>
        <h3 className={styles.sectionTitle}>➕ Yeni Kullanıcı</h3>
        <form className={styles.createForm} onSubmit={handleCreate}>
          <input
            className={styles.ipt}
            type="text"
            placeholder="Kullanıcı adı"
            value={newUsername}
            onChange={e => setNewUsername(e.target.value)}
          />
          <input
            className={styles.ipt}
            type="password"
            placeholder="Şifre"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
          />
          <select
            className={styles.select}
            value={newRole}
            onChange={e => setNewRole(e.target.value)}
          >
            <option value="superadmin">Süper Admin</option>
            <option value="yayinci">Yayıncı</option>
            <option value="moderator">Moderatör</option>
          </select>
          <button className={tabStyles.btnPrimary} type="submit" disabled={creating}>
            {creating ? 'Oluşturuluyor...' : 'Oluştur'}
          </button>
        </form>
      </div>}

      {/* Kullanıcı listesi */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>👥 Mevcut Kullanıcılar</h3>
        {loading ? (
          <p className={styles.empty}>Yükleniyor...</p>
        ) : users.length === 0 ? (
          <p className={styles.empty}>Henüz kullanıcı yok.</p>
        ) : (
          <div className={styles.userList}>
            {users.map(u => (
              <div key={u.id} className={styles.userRow}>
                <div className={styles.userInfo}>
                  <span className={styles.userName}>{u.username}</span>
                  <span className={styles.userRole}>{ROLE_LABELS[u.role] ?? u.role}</span>
                </div>

                {isSA && (editId === u.id ? (
                  <div className={styles.editRow}>
                    <input
                      className={styles.ipt}
                      type="password"
                      placeholder="Yeni şifre"
                      value={editPassword}
                      onChange={e => setEditPassword(e.target.value)}
                      autoFocus
                    />
                    <button className={tabStyles.btnPrimary} onClick={() => handlePasswordSave(u.id)} disabled={saving}>
                      {saving ? '...' : 'Kaydet'}
                    </button>
                    <button className={tabStyles.btnOutline} onClick={() => { setEditId(null); setEditPassword('') }}>
                      İptal
                    </button>
                  </div>
                ) : (
                  <div className={styles.actions}>
                    <button
                      className={tabStyles.btnOutline}
                      onClick={() => { setEditId(u.id); setEditPassword('') }}
                    >
                      🔑 Şifre Değiştir
                    </button>
                    <button
                      className={tabStyles.btnOutline}
                      style={{ color: '#ff6060', borderColor: 'rgba(255,96,96,0.4)' }}
                      onClick={() => handleDelete(u.id, u.username)}
                    >
                      🗑️ Sil
                    </button>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {msg && <div className={styles.msg}>{msg}</div>}
    </div>
  )
}
