import { createClient } from '@supabase/supabase-js'
import { createHash } from 'crypto'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')

  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const ip =
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.headers['x-real-ip'] ||
      req.socket?.remoteAddress ||
      'unknown'

    const today = new Date().toISOString().slice(0, 10) // "YYYY-MM-DD"

    // Hash IP + date — raw IP never stored
    const hash = createHash('sha256')
      .update(`${ip}|${today}|turnuva-salt`)
      .digest('hex')
      .slice(0, 32) // 32 hex chars is plenty unique, saves space

    const { error } = await supabase
      .from('visits')
      .upsert({ date: today, ip_hash: hash }, { onConflict: 'date,ip_hash', ignoreDuplicates: true })

    if (error) console.error('[log-visit]', error.message)

    return res.status(200).json({ ok: true })
  } catch (e) {
    console.error('[log-visit] exception:', e.message)
    return res.status(500).json({ ok: false })
  }
}
