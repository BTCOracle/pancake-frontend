import { Currency, CurrencyAmount, TradeType } from '@pancakeswap/swap-sdk-core'
import { RemoteLogger } from '@pancakeswap/utils/RemoteLogger'
import { Pool, Route, TradeWithGraph } from '../types'

export const logPools = (quoteId: string | undefined, pools: Pool[]) => {
  const logger = RemoteLogger.getLogger(quoteId)
  logger.debug(`${pools.length} candidate pools`, 2)
  _logPools(quoteId, pools, 3)
  logger.debug('\n')
}

function _logPools(quoteId: string | undefined, pools: Pool[], indent: number) {
  const logger = RemoteLogger.getLogger(quoteId)
  for (const pool of pools) {
    logger.debug(`${pool.log()}`, indent)
  }
}

export const logAmts = (
  quoteId: string | undefined,
  amts: {
    amount: CurrencyAmount<Currency>
    percent: number
  }[],
) => {
  const logger = RemoteLogger.getLogger(quoteId)
  logger.debug(`try route with ${amts.length} splits`, 2)
  for (const [i, amt] of Object.entries(amts)) {
    const { currency } = amt.amount
    const symbol = currency.isNative ? currency.symbol : currency.symbol
    logger.debug(`split#${i}: ${amt.amount.toExact()}${symbol} (${amt.percent})%`, 3)
  }
  logger.debug('\n')
}

export const logRouteForSplit = (quoteId: string | undefined, route: Route, amount: string, percent: string) => {
  const logger = RemoteLogger.getLogger(quoteId)
  logger.debug(`route find for ${amount} ${percent}, through pools:`, 3)
  _logPools(quoteId, route.pools, 4)
}

export const logTrade = (quoteId: string | undefined, trade?: TradeWithGraph<TradeType>) => {
  const logger = RemoteLogger.getLogger(quoteId)
  logger.debug('---')
  if (!trade) {
    logger.debug('no trade found', 1)
    return
  }
  logger.debug(`trade result found`, 1)
  logger.debugJson(
    {
      type: trade.tradeType,
      inputAmount: trade.inputAmount.toExact(),
      outputAmount: trade.outputAmount.toExact(),
      route: trade.routes,
    },
    2,
  )
  logger.debug('\n')
}
