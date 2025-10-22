import { NextApiHandler } from 'next'

const savedLogs: Map<string, string[]> = new Map()
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
}
const handler: NextApiHandler = async (req, res) => {
  if (process.env.NODE_ENV !== 'development') {
    return res.status(404).end()
  }
  if (req.method === 'POST') {
    const { body } = req
    const { id, logs } = body
    if (!id || !logs) {
      return res.status(400).json({ error: 'Missing id or logs' })
    }
    if (!Array.isArray(logs)) {
      return res.status(400).json({ error: 'Logs must be an array' })
    }
    savedLogs.set(id, logs)
    return res.status(200).json({ status: 'ok' })
  }

  const id = req.query.id as string
  const logs = savedLogs.get(id)
  return res.status(200).send(logs?.join('\n'))
}

export default handler
