export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { usernames } = req.query
  if (!usernames) {
    return res.status(400).json({ error: 'usernames zorunlu' })
  }

  const list = usernames.split(',').map(s => s.trim()).filter(Boolean)

  const HEADERS = {
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Referer': 'https://kick.com/',
    'Origin': 'https://kick.com',
  }

  async function checkUser(username) {
    for (const url of [
      `https://kick.com/api/v2/channels/${encodeURIComponent(username)}`,
      `https://kick.com/api/v1/channels/${encodeURIComponent(username)}`,
    ]) {
      try {
        const r = await fetch(url, { headers: HEADERS })
        const text = await r.text()
        console.log(`[kick-live] ${username} | ${url} | status:${r.status} | body:${text.slice(0, 200)}`)
        if (!r.ok) continue
        try {
          const data = JSON.parse(text)
          return !!data?.livestream
        } catch { continue }
      } catch (e) {
        console.log(`[kick-live] ${username} | fetch error:`, e.message)
      }
    }
    return false
  }

  const results = {}
  await Promise.all(
    list.map(async (username) => {
      results[username] = await checkUser(username)
    })
  )

  return res.status(200).json(results)
}
