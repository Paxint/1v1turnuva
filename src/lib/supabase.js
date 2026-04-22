import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

const isConfigured = !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY)

function logErr(fn, error) {
  if (error) console.error(`[supabase] ${fn}:`, error.message ?? error)
}

// ─── Admin API helper ────────────────────────────────────────────────────────

function getAdminToken() {
  try {
    return JSON.parse(sessionStorage.getItem('paxint_admin_session') || '{}').token ?? null
  } catch { return null }
}

async function adminApi(action, payload = {}) {
  const token = getAdminToken()
  const res = await fetch('/api/admin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ action, payload }),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `Admin API error ${res.status}`)
  }
  return res.json()
}

// ─── Settings ────────────────────────────────────────────────────────────────

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
  try {
    await adminApi('setSetting', { broadcaster, key, value })
  } catch (e) { logErr('setSetting', e) }
}

export async function deleteSetting(broadcaster, key) {
  if (!isConfigured) return
  try {
    await adminApi('deleteSetting', { broadcaster, key })
  } catch (e) { logErr('deleteSetting', e) }
}

// ─── Broadcasters ────────────────────────────────────────────────────────────

export async function getBroadcasters() {
  if (!isConfigured) return []
  try {
    const { data, error } = await supabase
      .from('broadcasters')
      .select('*')
      .eq('broadcaster_key', 'shared')
      .order('sort_order')
    logErr('getBroadcasters', error)
    return data ?? []
  } catch (e) { logErr('getBroadcasters', e); return [] }
}

export async function saveBroadcasters(list) {
  if (!isConfigured) return
  try {
    await adminApi('saveBroadcasters', { list })
  } catch (e) { logErr('saveBroadcasters', e) }
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
  try {
    await adminApi('saveRules', { broadcaster, rules })
  } catch (e) { logErr('saveRules', e) }
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
  try {
    await adminApi('deleteRegistration', { id })
  } catch (e) { logErr('deleteRegistration', e) }
}

export async function clearRegistrations() {
  if (!isConfigured) return
  try {
    await adminApi('clearRegistrations')
  } catch (e) { logErr('clearRegistrations', e) }
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

// ─── Bracket ─────────────────────────────────────────────────────────────────

export async function getBracket() {
  const val = await getSetting('global', 'bracket')
  if (!val) return null
  try { return JSON.parse(val) } catch { return null }
}

export async function saveBracket(data) {
  if (data === null) return deleteSetting('global', 'bracket')
  return setSetting('global', 'bracket', JSON.stringify(data))
}

// ─── Admin Action Logs ───────────────────────────────────────────────────────

export async function logAction(action) {
  if (!isConfigured) return
  try {
    const session = JSON.parse(sessionStorage.getItem('paxint_admin_session') || '{}')
    const username = session.username || 'bilinmiyor'
    await adminApi('logAction', { username, action })
  } catch (e) { logErr('logAction', e) }
}

export async function getAdminLogs(limit = 100) {
  if (!isConfigured) return []
  try {
    const { data } = await adminApi('getAdminLogs', { limit })
    return data ?? []
  } catch (e) { logErr('getAdminLogs', e); return [] }
}

// ─── Admin Users ─────────────────────────────────────────────────────────────

async function hashPassword(password) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

export async function getAdminUsers() {
  if (!isConfigured) return []
  try {
    const { data } = await adminApi('getAdminUsers')
    return data ?? []
  } catch (e) { logErr('getAdminUsers', e); return [] }
}

export async function createAdminUser(username, password, role) {
  if (!isConfigured) return { data: null, error: new Error('Supabase not configured') }
  try {
    const password_hash = await hashPassword(password)
    const { data } = await adminApi('createAdminUser', { username, password_hash, role })
    return { data, error: null }
  } catch (e) { logErr('createAdminUser', e); return { data: null, error: e } }
}

export async function updateAdminUserPassword(id, newPassword) {
  if (!isConfigured) return new Error('Supabase not configured')
  try {
    const password_hash = await hashPassword(newPassword)
    await adminApi('updateAdminUserPassword', { id, password_hash })
    return null
  } catch (e) { logErr('updateAdminUserPassword', e); return e }
}

export async function deleteAdminUser(id) {
  if (!isConfigured) return
  try {
    await adminApi('deleteAdminUser', { id })
  } catch (e) { logErr('deleteAdminUser', e) }
}

// ─── Visit counts ────────────────────────────────────────────────────────────

export async function getVisitCounts() {
  if (!isConfigured) return []
  try {
    const { data } = await adminApi('getVisitCounts')
    if (!data) return []
    const map = {}
    for (const row of data) {
      map[row.date] = (map[row.date] || 0) + 1
    }
    return Object.entries(map)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => b.date.localeCompare(a.date))
  } catch (e) { logErr('getVisitCounts', e); return [] }
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
