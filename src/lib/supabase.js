import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

const isConfigured = !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY)

function logErr(fn, error) {
  if (error) console.error(`[supabase] ${fn}:`, error.message ?? error)
}

// ─── Settings ───────────────────────────────────────────────────────────────

export async function getSetting(broadcaster, key) {
  if (!isConfigured) return null
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('broadcaster', broadcaster)
      .eq('key', key)
      .maybeSingle()
    logErr('getSetting', error)
    return data?.value ?? null
  } catch (e) { logErr('getSetting', e); return null }
}

export async function setSetting(broadcaster, key, value) {
  if (!isConfigured) return
  const { error } = await supabase
    .from('settings')
    .upsert({ broadcaster, key, value }, { onConflict: 'broadcaster,key' })
  logErr('setSetting', error)
}

export async function deleteSetting(broadcaster, key) {
  if (!isConfigured) return
  const { error } = await supabase
    .from('settings')
    .delete()
    .eq('broadcaster', broadcaster)
    .eq('key', key)
  logErr('deleteSetting', error)
}

// ─── Broadcasters ────────────────────────────────────────────────────────────

export async function getBroadcasters(broadcasterKey) {
  if (!isConfigured) return []
  try {
    let q = supabase.from('broadcasters').select('*').order('sort_order')
    if (broadcasterKey) q = q.eq('broadcaster_key', broadcasterKey)
    const { data, error } = await q
    logErr('getBroadcasters', error)
    return data ?? []
  } catch (e) { logErr('getBroadcasters', e); return [] }
}

export async function saveBroadcasters(broadcasterKey, list) {
  if (!isConfigured) return
  const { error: delErr } = await supabase.from('broadcasters').delete().eq('broadcaster_key', broadcasterKey)
  logErr('saveBroadcasters(delete)', delErr)
  if (list.length === 0) return
  const { error: insErr } = await supabase.from('broadcasters').insert(
    list.map((b, i) => ({
      broadcaster_key: broadcasterKey,
      sort_order: i,
      name: b.name,
      subtitle: b.subtitle,
      image_url: b.image_url || '',
      effect: b.effect || 'none',
    }))
  )
  logErr('saveBroadcasters(insert)', insErr)
}

// ─── Rules ───────────────────────────────────────────────────────────────────

export async function getRules(broadcaster) {
  if (!isConfigured) return []
  try {
    const { data, error } = await supabase
      .from('rules')
      .select('*')
      .eq('broadcaster', broadcaster)
      .order('sort_order')
    logErr('getRules', error)
    return data ?? []
  } catch (e) { logErr('getRules', e); return [] }
}

export async function saveRules(broadcaster, rules) {
  if (!isConfigured) return
  const { error: delErr } = await supabase.from('rules').delete().eq('broadcaster', broadcaster)
  logErr('saveRules(delete)', delErr)
  if (rules.length === 0) return
  const { error: insErr } = await supabase.from('rules').insert(
    rules.map((r, i) => ({
      broadcaster,
      title: r.title,
      items: r.items,
      sort_order: i,
    }))
  )
  logErr('saveRules(insert)', insErr)
}

// ─── Registrations ───────────────────────────────────────────────────────────

export async function getRegistrations() {
  if (!isConfigured) return []
  try {
    const { data, error } = await supabase
      .from('registrations')
      .select('*')
      .order('created_at', { ascending: true })
    logErr('getRegistrations', error)
    return data ?? []
  } catch (e) { logErr('getRegistrations', e); return [] }
}

export async function addRegistration(kickNick, lolNick) {
  if (!isConfigured) return { data: null, error: new Error('Supabase not configured') }
  const { data, error } = await supabase
    .from('registrations')
    .insert({ kick_nick: kickNick, lol_nick: lolNick })
    .select()
    .single()
  logErr('addRegistration', error)
  return { data, error }
}

export async function deleteRegistration(id) {
  if (!isConfigured) return
  const { error } = await supabase.from('registrations').delete().eq('id', id)
  logErr('deleteRegistration', error)
}

export async function clearRegistrations() {
  if (!isConfigured) return
  const { error } = await supabase.from('registrations').delete().neq('id', 0)
  logErr('clearRegistrations', error)
}

// ─── Realtime ────────────────────────────────────────────────────────────────

export function subscribeToTable(table, callback) {
  if (!isConfigured) return () => {}
  const channel = supabase
    .channel(`realtime:${table}:${Math.random()}`)
    .on('postgres_changes', { event: '*', schema: 'public', table }, callback)
    .subscribe()
  return () => supabase.removeChannel(channel)
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
