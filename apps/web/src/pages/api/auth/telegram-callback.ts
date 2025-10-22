import crypto from 'crypto'
import { getAuth } from 'firebase-admin/auth'
import { firebaseAdmin } from 'lib/firebase-admin'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).end('Method Not Allowed')
    return
  }

  const { hash, ...authData } = req.body
  console.log({ authData, hash }, 'handler POST body')

  try {
    if (!hash || typeof hash !== 'string') {
      res.status(400).json({ error: 'Invalid hash' })
      return
    }

    // sort the authData by key
    const dataCheckString = Object.keys(authData)
      .sort()
      .map((key) => `${key}=${authData[key]}`)
      .join('\n')

    const secretKey = crypto.createHash('sha256').update(process.env.TELEGRAM_BOT_TOKEN!).digest()

    const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex')

    if (calculatedHash !== hash) {
      console.error('Hash mismatch:', { calculatedHash, hash })
      res.status(401).json({ error: 'Authentication failed: hash mismatch' })
      return
    }

    const telegramId = authData.id
    if (!telegramId) {
      res.status(400).json({ error: 'Missing telegram id' })
      return
    }

    await firebaseAdmin()
    const customToken = await getAuth().createCustomToken(`telegram:${telegramId}`, {
      telegramUsername: authData.username,
    })

    res.status(200).json({ customToken })
  } catch (err) {
    console.error('[Telegram callback error]:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
}
