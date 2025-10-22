import { Currency, Price } from '@pancakeswap/swap-sdk-core'
import { encodeSqrtRatioX96, nearestUsableTick, priceToClosestTick, TickMath } from '@pancakeswap/v3-sdk'

export function tryParseTick(price: Price<Currency, Currency>, tickSpacing: number): number | undefined {
  if (!price || !tickSpacing) {
    return undefined
  }

  // check price is within min/max bounds, if outside return min/max
  const sqrtRatioX96 = encodeSqrtRatioX96(price.numerator, price.denominator)

  let tick: number

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
