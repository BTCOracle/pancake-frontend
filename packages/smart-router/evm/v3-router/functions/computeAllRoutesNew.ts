import { Currency } from '@pancakeswap/sdk'

import { Graph } from '@pancakeswap/utils/Graph'
import { RemoteLogger } from '@pancakeswap/utils/RemoteLogger'
import { BaseRoute, Pool } from '../types'
import { buildBaseRoute, getCurrenciesOfPool } from '../utils'
import { poolInfoStr } from '../utils/remoteLogs'

export function computeAllRoutesNew(
  input: Currency,
  output: Currency,
  candidatePools: Pool[],
  maxHops = 3,
  quoteId?: string,
): BaseRoute[] {
  const logger = RemoteLogger.getLogger(quoteId)
  logger.metric(`computeAllRoutesNew`, 1)
  const graph = new Graph<Currency, Pool>((c) => c.wrapped.address)
  candidatePools.forEach((pool) => {
    const currencies = getCurrenciesOfPool(pool)
    const tokenA = currencies[0]
    const tokenB = currencies[1]
    graph.addEdge(tokenA, tokenB, pool)
    graph.addEdge(tokenB, tokenA, pool)
    logger.debug(`add pool ${poolInfoStr(pool)}`)
  })
  const paths = graph.findPaths(input, output, 'dfs', maxHops)
  const routes: BaseRoute[] = paths.map(({ edges }) => buildBaseRoute(edges, input, output))
  logger.metric(`route find`, 1)
  return routes
}
