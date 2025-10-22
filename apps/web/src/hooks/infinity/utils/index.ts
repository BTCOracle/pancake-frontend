import { Q192 } from '@pancakeswap/routing-sdk-addon-v3'
import { Currency, Price, sortCurrencies } from '@pancakeswap/swap-sdk-core'
import { encodeSqrtRatioX96, nearestUsableTick, TickMath } from '@pancakeswap/v3-sdk'

export function tryParseTick(price: Price<Currency, Currency> | boolean, tickSpacing: number): number | undefined {
  if (!price || !tickSpacing || typeof price === 'boolean') {
    return undefined
  }

  let tick: number

  // check price is within min/max bounds, if outside return min/max
  const sqrtRatioX96 = encodeSqrtRatioX96(price.numerator, price.denominator)

  if (sqrtRatioX96 >= TickMath.MAX_SQRT_RATIO) {
    tick = TickMath.MAX_TICK
  } else if (sqrtRatioX96 <= TickMath.MIN_SQRT_RATIO) {
    tick = TickMath.MIN_TICK
  } else {
    // this function is agnostic to the base, will always return the correct tick
    tick = priceToClosestTick(price)
  }

  return nearestUsableTick(tick, tickSpacing)
}

/**
 * Returns a price object corresponding to the input tick and the base/quote token
 * Inputs must be tokens because the address order is used to interpret the price represented by the tick
 * @param baseToken the base token of the price
 * @param quoteToken the quote token of the price
 * @param tick the tick for which to return the price
 */
export function tickToPrice(baseToken: Currency, quoteToken: Currency, tick: number): Price<Currency, Currency> {
  const sqrtRatioX96 = TickMath.getSqrtRatioAtTick(tick)

  const ratioX192 = sqrtRatioX96 * sqrtRatioX96

  const [sortedBaseToken] = sortCurrencies([baseToken, quoteToken])
  const sorted = sortedBaseToken.equals(baseToken)

  return sorted ? new Price(baseToken, quoteToken, Q192, ratioX192) : new Price(baseToken, quoteToken, ratioX192, Q192)
}

/**
 * Returns the first tick for which the given price is greater than or equal to the tick price
 * @param price for which to return the closest tick that represents a price less than or equal to the input price,
 * i.e. the price of the returned tick is less than or equal to the input price
 */
export function priceToClosestTick(price: Price<Currency, Currency>): number {
  // const sorted = price.baseCurrency.sortsBefore(price.quoteCurrency)

  const [sortedBaseCurrency] = sortCurrencies([price.baseCurrency, price.quoteCurrency])
  const sorted = sortedBaseCurrency.equals(price.baseCurrency)

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
