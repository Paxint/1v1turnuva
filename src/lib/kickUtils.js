export function extractKickUsername(url) {
  if (!url) return null
  try {
    const u = new URL(url)
    if (!u.hostname.includes('kick.com')) return null
    const parts = u.pathname.split('/').filter(Boolean)
    return parts[0] || null
  } catch {
    return null
  }
}
