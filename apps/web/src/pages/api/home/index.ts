import { cacheByLRU } from '@pancakeswap/utils/cacheByLRU'
import { NextApiHandler } from 'next'
import { homePageChainsInfo, homePageCurrencies, partners } from './homePageDataQuery'
import { queryPools } from './queries/queryPools'
import { queryPredictionUser } from './queries/queryPrediction'
import { queryTokens } from './queries/queryTokens'
import { querySiteStats } from './querySiteStats'
import { HomePageData } from './types'

async function _load() {
  const [{ topTokens }, stats, topWinner] = await Promise.all([queryTokens(), querySiteStats(), queryPredictionUser()])
  const pools = await queryPools()
  const currencies = homePageCurrencies
  const chains = homePageChainsInfo()
  return {
    tokens: topTokens,
    pools,
    currencies,
    chains,
    stats,
    partners,
    topWinner,
  } as HomePageData
}
export const loadHomePageData = cacheByLRU(_load, {
  ttl: 300 * 1000, // 5 minutes for update
  maxAge: 60 * 60 * 1000, // 1 hour
})

const handler: NextApiHandler = async (req, res) => {
  res.setHeader('Cache-Control', 's-maxage=60, max-age=30, stale-while-revalidate=300')
  const data = await loadHomePageData()
  return res.status(200).json(data)
}

export default handler
