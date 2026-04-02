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

  const results = {}
  await Promise.all(
    list.map(async (username) => {
      try {
        const r = await fetch(
          `https://kick.com/api/v2/channels/${encodeURIComponent(username)}`,
          {
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            },
          }
        )
        if (!r.ok) { results[username] = false; return }
        const data = await r.json()
        results[username] = !!data?.livestream
      } catch {
        results[username] = false
      }
    })
  )

  return res.status(200).json(results)
}
