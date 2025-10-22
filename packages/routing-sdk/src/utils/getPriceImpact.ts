import { CurrencyAmount, Percent, TradeType, Price, Currency, Token } from '@pancakeswap/swap-sdk-core'

import { Trade, Route } from '../types'

export function getPriceImpact(
  trade: Pick<Trade<TradeType>, 'outputAmount' | 'routes'> & {
    routes: Pick<Route, 'path' | 'pools'>[]
  },
): Percent {
  let spotOutputAmount = CurrencyAmount.fromRawAmount(trade.outputAmount.currency.wrapped, 0)
  for (const route of trade.routes) {
    const { inputAmount } = route
    // FIXME typing
    const midPrice: any = getMidPrice(route)
    spotOutputAmount = spotOutputAmount.add(midPrice.quote(inputAmount.wrapped))
  }
  const priceImpact = spotOutputAmount.subtract(trade.outputAmount.wrapped).divide(spotOutputAmount)
  return new Percent(priceImpact.numerator, priceImpact.denominator)
}

export function getMidPrice({ path, pools }: Pick<Route, 'path' | 'pools'>) {
  let i = 0
  let price: Price<Currency, Currency> | null = null
  for (const pool of pools) {
    const input = path[i].wrapped
    const output = path[i + 1].wrapped
    const poolPrice = pool.getCurrentPrice(input, output).wrapped as Price<Token, Token>

    price = price ? (price.wrapped.multiply(poolPrice) as Price<Token, Token>) : poolPrice
    i += 1
  }

  if (!price) {
    throw new Error('Get mid price failed')
  }
  return price
}
