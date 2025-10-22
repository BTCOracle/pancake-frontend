import { Currency, isCurrencySorted, Price, sortCurrencies, Token } from '@pancakeswap/swap-sdk-core'
import { Q192 } from '../internalConstants'
import { encodeSqrtRatioX96 } from './encodeSqrtRatioX96'
import { TickMath } from './tickMath'
/**
 * Returns a price object corresponding to the input tick and the base/quote token
 * Inputs must be tokens because the address order is used to interpret the price represented by the tick
 * @param baseToken the base token of the price
 * @param quoteToken the quote token of the price
 * @param tick the tick for which to return the price
 */
export function tickToPrice<TBase extends Currency | Token, TQuote extends Currency | Token>(
  baseToken: TBase,
  quoteToken: TQuote,
  tick: number
): Price<TBase, TQuote> {
  const sqrtRatioX96 = TickMath.getSqrtRatioAtTick(tick)

  const ratioX192 = sqrtRatioX96 * sqrtRatioX96

  return isCurrencySorted(baseToken, quoteToken)
    ? new Price(baseToken, quoteToken, Q192, ratioX192)
    : new Price(baseToken, quoteToken, ratioX192, Q192)
}

/**
 * Returns a price object corresponding to the input tick and the base/quote token
 * Inputs must be tokens because the address order is used to interpret the price represented by the tick
 * @param baseToken the base token of the price
 * @param quoteToken the quote token of the price
 * @param tick the tick for which to return the price
 */
export function tickToPriceV2(baseToken: Currency, quoteToken: Currency, tick: number): Price<Currency, Currency> {
  const sqrtRatioX96 = TickMath.getSqrtRatioAtTick(tick)

  const ratioX192 = sqrtRatioX96 * sqrtRatioX96

  return sortCurrencies([baseToken, quoteToken])[0] === baseToken
    ? new Price(baseToken, quoteToken, Q192, ratioX192)
    : new Price(baseToken, quoteToken, ratioX192, Q192)
}

/**
 * Returns the first tick for which the given price is greater than or equal to the tick price
 * @param price for which to return the closest tick that represents a price less than or equal to the input price,
 * i.e. the price of the returned tick is less than or equal to the input price
 */
export function priceToClosestTick(price: Price<Currency, Currency>): number {
  const sorted = isCurrencySorted(price.baseCurrency, price.quoteCurrency)

  const sqrtRatioX96 = sorted
    ? encodeSqrtRatioX96(price.numerator, price.denominator)
    : encodeSqrtRatioX96(price.denominator, price.numerator)

  let tick = TickMath.getTickAtSqrtRatio(sqrtRatioX96)
  const nextTickPrice = tickToPrice(price.baseCurrency, price.quoteCurrency, tick + 1)
  if (sorted) {
    if (!price.lessThan(nextTickPrice)) {
      tick++
    }
  } else if (!price.greaterThan(nextTickPrice)) {
    tick++
  }
  return tick
}
