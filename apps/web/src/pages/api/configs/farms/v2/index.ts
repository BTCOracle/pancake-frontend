import {
  UNIVERSAL_FARMS_WITH_TESTNET,
  fetchAllUniversalFarms,
  formatUniversalFarmToSerializedFarm,
} from '@pancakeswap/farms'
import { cacheByLRU } from '@pancakeswap/utils/cacheByLRU'
import { NextApiHandler } from 'next'
import { stringify } from 'viem'

const _fetchFarmData = async (includeTestnet: boolean) => {
  const fetchFarmConfig = await fetchAllUniversalFarms()
  const farmConfig = includeTestnet ? [...fetchFarmConfig, ...UNIVERSAL_FARMS_WITH_TESTNET] : fetchFarmConfig
  return formatUniversalFarmToSerializedFarm(farmConfig)
}

const fetchFarmData = cacheByLRU(_fetchFarmData, {
  ttl: 20_000,
  key: (params) => {
    return [params[0]]
  },
})

const handler: NextApiHandler = async (req, res) => {
  try {
    const includeTestnet = !!req.query.includeTestnet
    const legacyFarmConfig = await fetchFarmData(includeTestnet)

    // cache for long time, it should revalidate on every deployment
    res.setHeader('Cache-Control', `max-age=300, s-maxage=300`)

    return res.status(200).json({
      data: JSON.parse(stringify(legacyFarmConfig)),
      lastUpdatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: JSON.parse(stringify(error)) })
  }
}

export default handler
