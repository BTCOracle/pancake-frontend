import type { NextApiRequest, NextApiResponse } from 'next'
import { number as zNumber, object as zObject, string as zString } from 'zod'

const zBody = zObject({
  address: zString(),
  timestamp: zNumber(),
  nonce: zString().or(zNumber()),
  contractAddress: zString(),
  signature: zString(),
})

export const config = {
  api: {
    bodyParser: true,
  },
}

const sign = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  let body: unknown
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
  } catch (e) {
    return res.status(400).json({ message: 'Invalid JSON in request body' })
  }

  const parsed = zBody.safeParse(body)
  if (parsed.success === false) {
    return res.status(400).json({ message: 'Invalid request body', reason: parsed.error })
  }

  const { address, timestamp, nonce, signature, contractAddress } = parsed.data

  try {
    const response = await fetch(
      `https://www.binance.com/bapi/defi/v2/public/wallet-direct/wallet/address/sign?address=${address}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'x-gray-env': 'infra',
        },
        body: JSON.stringify({
          address,
          timestamp,
          nonce,
          signature,
          contractAddress,
        }),
      },
    )

    const result = await response.json()
    return res.status(200).json(result)
  } catch (error) {
    console.error('Error calling Binance API:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

export default sign
