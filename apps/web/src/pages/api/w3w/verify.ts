import type { NextApiRequest, NextApiResponse } from 'next'
import qs from 'qs'
import { object as zObject, string as zString } from 'zod'

const zQuery = zObject({
  address: zString(),
  timestamp: zString(),
})

const verify = async (req: NextApiRequest, res: NextApiResponse) => {
  const queryString = qs.stringify(req.query)
  const queryParsed = qs.parse(queryString)
  const parsed = zQuery.safeParse(queryParsed)
  if (parsed.success === false) {
    return res.status(400).json({ message: 'Invalid query', reason: parsed.error })
  }

  const { address, timestamp } = parsed.data
  const response = await fetch(
    `https://www.binance.com/bapi/defi/v1/public/wallet-direct/wallet/address/verify?address=${address}&timestamp=${timestamp}`,
    // {
    //   headers: {
    //     'x-gray-env': 'infra',
    //   },
    // },
  )
  const result = await response.json()
  return res.status(200).json(result)
}

export default verify
