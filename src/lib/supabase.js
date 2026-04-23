import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

const isConfigured = !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY)

function logErr(fn, error) {
  if (error) console.error(`[supabase] ${fn}:`, error.message ?? error)
}

// ─── Server-side admin helper ────────────────────────────────────────────────

async function adminFetch(action, payload = {}) {
  const session = JSON.parse(sessionStorage.getItem('paxint_admin_session') || '{}')
  const token = session.token || ''
  const res = await fetch('/api/admin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ action, ...payload }),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`)
  return json
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
  await adminFetch('setSetting', { broadcaster, key, value })
}

export async function deleteSetting(broadcaster, key) {
  await adminFetch('deleteSetting', { broadcaster, key })
}

// ─── Broadcasters ────────────────────────────────────────────────────────────

export async function getBroadcasters() {
  if (!isConfigured) return []
  try {
    const { data, error } = await supabase.from('broadcasters').select('*').eq('broadcaster_key', 'shared').order('sort_order')
    logErr('getBroadcasters', error)
    return data ?? []
  } catch (e) { logErr('getBroadcasters', e); return [] }
}

export async function saveBroadcasters(list) {
  await adminFetch('saveBroadcasters', { list })
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
  await adminFetch('saveRules', { broadcaster, rules })
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
  await adminFetch('deleteRegistration', { id })
}

export async function clearRegistrations() {
  await adminFetch('clearRegistrations')
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
  try {
    const session = JSON.parse(sessionStorage.getItem('paxint_admin_session') || '{}')
    await adminFetch('logAction', { username: session.username || 'bilinmiyor', action })
  } catch (e) { logErr('logAction', e) }
}

export async function getAdminLogs(limit = 100) {
  try {
    const { data } = await adminFetch('getAdminLogs', { limit })
    return data ?? []
  } catch (e) { logErr('getAdminLogs', e); return [] }
}

// ─── Admin Users ─────────────────────────────────────────────────────────────

export async function getAdminUsers() {
  try {
    const { data } = await adminFetch('getAdminUsers')
    return data ?? []
  } catch (e) { logErr('getAdminUsers', e); return [] }
}

export async function createAdminUser(username, password, role) {
  try {
    const { data } = await adminFetch('createAdminUser', { username, password, role })
    return { data, error: null }
  } catch (e) { logErr('createAdminUser', e); return { data: null, error: e } }
}

export async function updateAdminUserPassword(id, newPassword) {
  try {
    await adminFetch('updateAdminUserPassword', { id, newPassword })
    return null
  } catch (e) { logErr('updateAdminUserPassword', e); return e }
}

export async function deleteAdminUser(id) {
  await adminFetch('deleteAdminUser', { id })
}

// ─── Visit counts ────────────────────────────────────────────────────────────

export async function getVisitCounts() {
  try {
    const { data } = await adminFetch('getVisitCounts')
    return data ?? []
  } catch (e) { logErr('getVisitCounts', e); return [] }
}

// ─── Storage ─────────────────────────────────────────────────────────────────

export async function uploadImage(path, file) {
  const fileData = await new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result.split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
  const { publicUrl } = await adminFetch('uploadImage', { path, fileData, contentType: file.type })
  return publicUrl
}
