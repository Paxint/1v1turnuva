import { createClient } from '@supabase/supabase-js'
import { createHmac } from 'crypto'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

const SECRET = process.env.ADMIN_SECRET

function verifyToken(token) {
  if (!token || !SECRET) return null
  const lastDot = token.lastIndexOf('.')
  if (lastDot === -1) return null
  const payload = token.slice(0, lastDot)
  const sig = token.slice(lastDot + 1)
  const expected = createHmac('sha256', SECRET).update(payload).digest('hex')
  if (sig !== expected) return null
  const parts = payload.split(':')
  if (parts.length < 3) return null
  const expires = parseInt(parts[parts.length - 1])
  if (Date.now() > expires) return null
  const role = parts[parts.length - 2]
  const username = parts.slice(0, parts.length - 2).join(':')
  return { username, role }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'POST') return res.status(405).end()

  const authHeader = req.headers.authorization || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
  const session = verifyToken(token)
  if (!session) return res.status(401).json({ error: 'Unauthorized' })

  const { action, payload = {} } = req.body || {}

  try {
    switch (action) {
      // ── Settings ─────────────────────────────────────────────────────────
      case 'setSetting': {
        const { broadcaster, key, value } = payload
        const { error } = await supabase
          .from('settings')
          .upsert({ broadcaster, key, value }, { onConflict: 'broadcaster,key' })
        if (error) throw error
        return res.status(200).json({ ok: true })
      }
      case 'deleteSetting': {
        const { broadcaster, key } = payload
        const { error } = await supabase
          .from('settings')
          .delete()
          .eq('broadcaster', broadcaster)
          .eq('key', key)
        if (error) throw error
        return res.status(200).json({ ok: true })
      }

      // ── Broadcasters ──────────────────────────────────────────────────────
      case 'saveBroadcasters': {
        const { list } = payload
        const { error: delErr } = await supabase
          .from('broadcasters')
          .delete()
          .eq('broadcaster_key', 'shared')
        if (delErr) throw delErr
        if (list.length > 0) {
          const { error: insErr } = await supabase.from('broadcasters').insert(
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
          if (insErr) throw insErr
        }
        return res.status(200).json({ ok: true })
      }

      // ── Rules ─────────────────────────────────────────────────────────────
      case 'saveRules': {
        const { broadcaster, rules } = payload
        const { error: delErr } = await supabase
          .from('rules')
          .delete()
          .eq('broadcaster', broadcaster)
        if (delErr) throw delErr
        if (rules.length > 0) {
          const { error: insErr } = await supabase.from('rules').insert(
            rules.map((r, i) => ({
              broadcaster,
              title: r.title,
              items: r.items,
              sort_order: i,
            }))
          )
          if (insErr) throw insErr
        }
        return res.status(200).json({ ok: true })
      }

      // ── Registrations ─────────────────────────────────────────────────────
      case 'deleteRegistration': {
        const { id } = payload
        const { error } = await supabase.from('registrations').delete().eq('id', id)
        if (error) throw error
        return res.status(200).json({ ok: true })
      }
      case 'clearRegistrations': {
        const { error } = await supabase.from('registrations').delete().neq('id', 0)
        if (error) throw error
        return res.status(200).json({ ok: true })
      }

      // ── Admin Logs ────────────────────────────────────────────────────────
      case 'logAction': {
        const { username, action: act } = payload
        const { error } = await supabase
          .from('admin_logs')
          .insert({ username, action: act })
        if (error) throw error
        return res.status(200).json({ ok: true })
      }
      case 'getAdminLogs': {
        const { limit = 100 } = payload
        const { data, error } = await supabase
          .from('admin_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(limit)
        if (error) throw error
        return res.status(200).json({ data })
      }

      // ── Visit Counts ──────────────────────────────────────────────────────
      case 'getVisitCounts': {
        const { data, error } = await supabase
          .from('visits')
          .select('date')
          .order('date', { ascending: false })
        if (error) throw error
        return res.status(200).json({ data })
      }

      // ── Admin Users (superadmin only) ──────────────────────────────────────
      case 'getAdminUsers': {
        if (session.role !== 'superadmin') return res.status(403).json({ error: 'Forbidden' })
        const { data, error } = await supabase
          .from('admin_users')
          .select('id, username, role, created_at')
          .order('created_at', { ascending: true })
        if (error) throw error
        return res.status(200).json({ data })
      }
      case 'createAdminUser': {
        if (session.role !== 'superadmin') return res.status(403).json({ error: 'Forbidden' })
        const { username, password_hash, role } = payload
        const { data, error } = await supabase
          .from('admin_users')
          .insert({ username, password_hash, role })
          .select()
          .single()
        if (error) throw error
        return res.status(200).json({ data })
      }
      case 'updateAdminUserPassword': {
        if (session.role !== 'superadmin') return res.status(403).json({ error: 'Forbidden' })
        const { id, password_hash } = payload
        const { error } = await supabase
          .from('admin_users')
          .update({ password_hash })
          .eq('id', id)
        if (error) throw error
        return res.status(200).json({ ok: true })
      }
      case 'deleteAdminUser': {
        if (session.role !== 'superadmin') return res.status(403).json({ error: 'Forbidden' })
        const { id } = payload
        const { error } = await supabase.from('admin_users').delete().eq('id', id)
        if (error) throw error
        return res.status(200).json({ ok: true })
      }

      default:
        return res.status(400).json({ error: `Unknown action: ${action}` })
    }
  } catch (e) {
    console.error('[admin]', action, e.message)
    return res.status(500).json({ error: e.message })
  }
}
