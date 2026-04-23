import { createClient } from '@supabase/supabase-js'
import { createHash } from 'crypto'

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const adminSecret = process.env.ADMIN_SECRET

function supa() {
  return createClient(supabaseUrl, supabaseServiceKey)
}

function hashPw(pw) {
  return createHash('sha256').update(pw).digest('hex')
}

function tokenOk(req) {
  const auth = req.headers['authorization'] || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null
  return token && token === adminSecret
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const body = req.body
  const { action } = body
  if (!action) return res.status(400).json({ error: 'action required' })

  const db = supa()

  // ─── Login (no token needed) ────────────────────────────────────────────────
  if (action === 'login') {
    const { username, password } = body
    if (!username || !password) return res.status(400).json({ error: 'Kullanıcı adı ve şifre gerekli' })

    const hash = hashPw(password)
    const { data } = await db
      .from('admin_users')
      .select('id, username, role')
      .eq('username', username)
      .eq('password_hash', hash)
      .maybeSingle()

    if (data) return res.status(200).json({ token: adminSecret, user: data })

    // env-var superadmin fallback
    const envPw = process.env.VITE_ADMIN_PASSWORD || 'Paxint2026'
    if (username === 'admin' && password === envPw) {
      return res.status(200).json({ token: adminSecret, user: { id: 0, username: 'admin', role: 'superadmin' } })
    }

    return res.status(401).json({ error: 'Geçersiz kullanıcı adı veya şifre' })
  }

  // ─── All other actions require valid token ──────────────────────────────────
  if (!tokenOk(req)) return res.status(401).json({ error: 'Yetkisiz erişim' })

  try {
    // Settings
    if (action === 'setSetting') {
      const { broadcaster, key, value } = body
      const { error } = await db.from('settings').upsert({ broadcaster, key, value }, { onConflict: 'broadcaster,key' })
      if (error) throw error
      return res.status(200).json({ ok: true })
    }

    if (action === 'deleteSetting') {
      const { broadcaster, key } = body
      const { error } = await db.from('settings').delete().eq('broadcaster', broadcaster).eq('key', key)
      if (error) throw error
      return res.status(200).json({ ok: true })
    }

    // Broadcasters
    if (action === 'saveBroadcasters') {
      const { list } = body
      const { error: de } = await db.from('broadcasters').delete().eq('broadcaster_key', 'shared')
      if (de) throw de
      if (list.length > 0) {
        const { error: ie } = await db.from('broadcasters').insert(
          list.map((b, i) => ({
            broadcaster_key: 'shared',
            sort_order: i,
            name: b.name,
            subtitle: b.subtitle,
            image_url: b.image_url || '',
            effect: b.effect || 'none',
            link_url: b.link_url || '',
          }))
        )
        if (ie) throw ie
      }
      return res.status(200).json({ ok: true })
    }

    // Rules
    if (action === 'saveRules') {
      const { broadcaster, rules } = body
      const { error: de } = await db.from('rules').delete().eq('broadcaster', broadcaster)
      if (de) throw de
      if (rules.length > 0) {
        const { error: ie } = await db.from('rules').insert(
          rules.map((r, i) => ({ broadcaster, title: r.title, items: r.items, sort_order: i }))
        )
        if (ie) throw ie
      }
      return res.status(200).json({ ok: true })
    }

    // Registrations
    if (action === 'deleteRegistration') {
      const { id } = body
      const { error } = await db.from('registrations').delete().eq('id', id)
      if (error) throw error
      return res.status(200).json({ ok: true })
    }

    if (action === 'clearRegistrations') {
      const { error } = await db.from('registrations').delete().neq('id', 0)
      if (error) throw error
      return res.status(200).json({ ok: true })
    }

    // Admin logs
    if (action === 'logAction') {
      const { username, action: act } = body
      const { error } = await db.from('admin_logs').insert({ username: username || 'bilinmiyor', action: act })
      if (error) throw error
      return res.status(200).json({ ok: true })
    }

    if (action === 'getAdminLogs') {
      const { limit = 100 } = body
      const { data, error } = await db.from('admin_logs').select('*').order('created_at', { ascending: false }).limit(limit)
      if (error) throw error
      return res.status(200).json({ data })
    }

    // Admin users
    if (action === 'getAdminUsers') {
      const { data, error } = await db.from('admin_users').select('id, username, role, created_at').order('created_at', { ascending: true })
      if (error) throw error
      return res.status(200).json({ data })
    }

    if (action === 'createAdminUser') {
      const { username, password, role } = body
      const password_hash = hashPw(password)
      const { data, error } = await db.from('admin_users').insert({ username, password_hash, role }).select().single()
      if (error) throw error
      return res.status(200).json({ data })
    }

    if (action === 'updateAdminUserPassword') {
      const { id, newPassword } = body
      const password_hash = hashPw(newPassword)
      const { error } = await db.from('admin_users').update({ password_hash }).eq('id', id)
      if (error) throw error
      return res.status(200).json({ ok: true })
    }

    if (action === 'deleteAdminUser') {
      const { id } = body
      const { error } = await db.from('admin_users').delete().eq('id', id)
      if (error) throw error
      return res.status(200).json({ ok: true })
    }

    // Visits
    if (action === 'getVisitCounts') {
      const { data, error } = await db.from('visits').select('date').order('date', { ascending: false })
      if (error) throw error
      const map = {}
      for (const row of data) map[row.date] = (map[row.date] || 0) + 1
      const result = Object.entries(map).map(([date, count]) => ({ date, count })).sort((a, b) => b.date.localeCompare(a.date))
      return res.status(200).json({ data: result })
    }

    // Image upload (base64)
    if (action === 'uploadImage') {
      const { path, fileData, contentType } = body
      const buffer = Buffer.from(fileData, 'base64')
      const { data, error } = await db.storage.from('images').upload(path, buffer, { upsert: true, contentType })
      if (error) throw error
      const { data: { publicUrl } } = db.storage.from('images').getPublicUrl(data.path)
      return res.status(200).json({ publicUrl })
    }

    return res.status(400).json({ error: `Bilinmeyen action: ${action}` })
  } catch (e) {
    console.error('[admin]', action, e.message)
    return res.status(500).json({ error: e.message })
  }
}
