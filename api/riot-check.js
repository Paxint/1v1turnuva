import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { name, tag } = req.query
  if (!name || !tag) {
    return res.status(400).json({ error: 'name ve tag zorunlu' })
  }

  // Supabase service role ile riot_api_key oku
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  const { data } = await supabase
    .from('settings')
    .select('value')
    .eq('broadcaster', 'global')
    .eq('key', 'riot_api_key')
    .maybeSingle()

  const apiKey = data?.value
  if (!apiKey) {
    return res.status(500).json({ error: 'Riot API key ayarlanmamış' })
  }

  // Riot Account API — Europe cluster
  try {
    const response = await fetch(
      `https://europe.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(name)}/${encodeURIComponent(tag)}`,
      { headers: { 'X-Riot-Token': apiKey } }
    )

    if (response.status === 404) return res.status(200).json({ exists: false })
    if (!response.ok)           return res.status(200).json({ exists: false, riotStatus: response.status })

    return res.status(200).json({ exists: true })
  } catch {
    return res.status(500).json({ error: 'Riot API isteği başarısız' })
  }
}
