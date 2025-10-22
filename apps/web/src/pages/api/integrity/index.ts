const integrityMap = {
  tv: process.env.TV_JS_INTEGRITY,
}

export default function handler(req, res) {
  const { id } = req.query

  // TODO: Implement runtime integrity fetching from a secure API source to eliminate redeploys on hash changes
  if (!id || !integrityMap[id]) {
    return res.status(404).json({ error: 'Library ID not found' })
  }

  // Cache for 5 minutes
  res.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=59')

  return res.status(200).json({ integrity: integrityMap[id] })
}
