import { createClient } from '@supabase/supabase-js'
import { createHash, createHmac } from 'crypto'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

const SECRET = process.env.ADMIN_SECRET

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'POST') return res.status(405).end()

  if (!SECRET) {
    console.error('[admin-login] ADMIN_SECRET env var not set')
    return res.status(500).json({ error: 'Server not configured' })
  }

  const { username, password } = req.body || {}
  if (!username || !password) return res.status(400).json({ error: 'Missing credentials' })

  const hash = createHash('sha256').update(password).digest('hex')

  const { data, error } = await supabase
    .from('admin_users')
    .select('id, username, role')
    .eq('username', username)
    .eq('password_hash', hash)
    .maybeSingle()

  if (error) {
    console.error('[admin-login]', error.message)
    return res.status(500).json({ error: 'Database error' })
  }
  if (!data) return res.status(401).json({ error: 'Invalid credentials' })

  const expires = Date.now() + 8 * 60 * 60 * 1000 // 8 hours
  const payload = `${data.username}:${data.role}:${expires}`
  const sig = createHmac('sha256', SECRET).update(payload).digest('hex')

  return res.status(200).json({
    username: data.username,
    role: data.role,
    token: `${payload}.${sig}`,
    expires,
  })
}
