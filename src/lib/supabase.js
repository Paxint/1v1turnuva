import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

const isConfigured = !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY)

// ─── Settings ───────────────────────────────────────────────────────────────

export async function getSetting(broadcaster, key) {
  if (!isConfigured) return null
  try {
    const { data } = await supabase
      .from('settings')
      .select('value')
      .eq('broadcaster', broadcaster)
      .eq('key', key)
      .maybeSingle()
    return data?.value ?? null
  } catch { return null }
}

export async function setSetting(broadcaster, key, value) {
  if (!isConfigured) return
  await supabase
    .from('settings')
    .upsert({ broadcaster, key, value }, { onConflict: 'broadcaster,key' })
}

export async function deleteSetting(broadcaster, key) {
  if (!isConfigured) return
  await supabase
    .from('settings')
    .delete()
    .eq('broadcaster', broadcaster)
    .eq('key', key)
}

// ─── Broadcasters ────────────────────────────────────────────────────────────

export async function getBroadcasters(broadcasterKey) {
  if (!isConfigured) return []
  try {
    let q = supabase.from('broadcasters').select('*').order('sort_order')
    if (broadcasterKey) q = q.eq('broadcaster_key', broadcasterKey)
    const { data } = await q
    return data ?? []
  } catch { return [] }
}

export async function upsertBroadcaster(row) {
  if (!isConfigured) return
  await supabase
    .from('broadcasters')
    .upsert(row, { onConflict: 'broadcaster_key,sort_order' })
}

// ─── Rules ───────────────────────────────────────────────────────────────────

export async function getRules(broadcaster) {
  if (!isConfigured) return []
  try {
    const { data } = await supabase
      .from('rules')
      .select('*')
      .eq('broadcaster', broadcaster)
      .order('sort_order')
    return data ?? []
  } catch { return [] }
}

export async function saveRules(broadcaster, rules) {
  if (!isConfigured) return
  await supabase.from('rules').delete().eq('broadcaster', broadcaster)
  if (rules.length === 0) return
  await supabase.from('rules').insert(
    rules.map((r, i) => ({
      broadcaster,
      title: r.title,
      items: r.items,
      sort_order: i,
    }))
  )
}

// ─── Registrations ───────────────────────────────────────────────────────────

export async function getRegistrations() {
  if (!isConfigured) return []
  try {
    const { data } = await supabase
      .from('registrations')
      .select('*')
      .order('created_at', { ascending: true })
    return data ?? []
  } catch { return [] }
}

export async function addRegistration(kickNick, lolNick) {
  if (!isConfigured) return { data: null, error: new Error('Supabase not configured') }
  const { data, error } = await supabase
    .from('registrations')
    .insert({ kick_nick: kickNick, lol_nick: lolNick })
    .select()
    .single()
  return { data, error }
}

export async function deleteRegistration(id) {
  if (!isConfigured) return
  await supabase.from('registrations').delete().eq('id', id)
}

export async function clearRegistrations() {
  if (!isConfigured) return
  await supabase.from('registrations').delete().neq('id', 0)
}

// ─── Storage ─────────────────────────────────────────────────────────────────

export async function uploadImage(path, file) {
  if (!isConfigured) return null
  const { data, error } = await supabase.storage
    .from('images')
    .upload(path, file, { upsert: true, contentType: file.type })
  if (error) throw error
  const { data: { publicUrl } } = supabase.storage
    .from('images')
    .getPublicUrl(data.path)
  return publicUrl
}
