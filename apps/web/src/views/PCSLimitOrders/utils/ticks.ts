import { Currency, Price } from '@pancakeswap/sdk'
import { tickToPrice, tryParseTick } from 'hooks/infinity/utils'
import { tryParsePrice } from 'hooks/v3/utils'
import { BigNumber as BN } from 'bignumber.js'
import { nearestUsableTick } from '@pancakeswap/v3-sdk'
import { bigNumberToPrice } from './price'

/**
 * Get price adjusted to the nearest tick
 * @param price - Price to adjust, in string format
 * @param tickSpacing - Tick spacing
 * @param baseCurrency - Base currency
 * @param quoteCurrency - Quote currency
 * @returns Tick and price, if found
 */
export function getTickAdjustedPrice(
  price: string,
  tickSpacing: number,
  baseCurrency: Currency,
  quoteCurrency: Currency,
  zeroForOne?: boolean,
) {
  // manual check, tick to price failing for tickCurrent = 0 / price = 1
  if (BN(price).eq(1)) return { tick: 0, price: new Price(baseCurrency, quoteCurrency, '1', '1') }

  const price_ = tryParsePrice(baseCurrency, quoteCurrency, price)
  if (!price_) {
    console.error('getTickAdjustedPrice: No price found for given value', {
      price,
      tickSpacing,
      baseCurrency,
      quoteCurrency,
    })
    return { tick: undefined, price: undefined }
  }

  // Get closest tick
  const tick = tryParseTick(price_, tickSpacing)
  if (!tick) {
    console.error('getTickAdjustedPrice: No tick found for given price', {
      price,
      price_,
      tickSpacing,
      baseCurrency,
      quoteCurrency,
    })
    return { tick: undefined, price: price_ }
  }

  // Get price from tick
  const priceFromTick = tickToPrice(baseCurrency, quoteCurrency, tick)
  if (!priceFromTick) {
    console.error('getTickAdjustedPrice: No price found for given tick', {
      price,
      price_,
      tick,
      tickSpacing,
      baseCurrency,
      quoteCurrency,
    })
    return { tick, price: price_ }
  }

  // If zeroForOne is set, calculate and return sqrt price
  if (zeroForOne !== undefined) {
    const nextTick = zeroForOne ? tick + tickSpacing : tick - tickSpacing
    const nextPrice = tickToPrice(baseCurrency, quoteCurrency, nextTick)
    if (!nextPrice) {
      console.error('getTickAdjustedPrice: No price found for given tick', {
        tick,
        tickSpacing,
      })
      return { tick, price: priceFromTick }
    }
    const sqrtPrice = BN(priceFromTick.toFixed(18))
      .multipliedBy(BN(nextPrice.toFixed(18)))
      .sqrt()

    // Convert BigNumber to Price<Currency, Currency>
    const parsedSqrtPrice = bigNumberToPrice(sqrtPrice, baseCurrency, quoteCurrency)
    return { tick, price: parsedSqrtPrice }
  }

  return { tick, price: priceFromTick }
}

export function getSqrtPriceFromMarketPrice(
  marketPrice: string,
  baseCurrency: Currency,
  quoteCurrency: Currency,
  tickSpacing: number,
  tickCurrent: number,
  zeroForOne: boolean,
) {
  if (!marketPrice) return undefined

  // Get limit order tick from price
  const parsedPrice = tryParsePrice(baseCurrency, quoteCurrency, marketPrice)
  if (!parsedPrice) return undefined

  let targetTick = tryParseTick(parsedPrice, tickSpacing)
  if (!targetTick) return undefined

  // If current tick is between targetTick and its next tick, adjust it depending on direction

  // Visualize: targetTick < tickCurrent < targetTick + tickSpacing
  if (targetTick <= tickCurrent && targetTick + tickSpacing >= tickCurrent) {
    if (zeroForOne) targetTick += tickSpacing
    else targetTick -= tickSpacing * 2
  }

  // Visualize: targetTick - tickSpacing < tickCurrent < targetTick
  if (targetTick - tickSpacing <= tickCurrent && targetTick >= tickCurrent) {
    if (zeroForOne) targetTick += tickSpacing * 2
    else targetTick -= tickSpacing
  }

  // Calculate tickLower and tickUpper (Already correct for placing limit order)
  const tickLower = zeroForOne ? targetTick : targetTick - tickSpacing
  const tickUpper = zeroForOne ? targetTick + tickSpacing : targetTick

  // Determine if selling or buying at worse price. If worse, would need inverted ticks (disable this case in UI anyways)
  const isSellingOrBuyingAtWorsePrice = zeroForOne ? tickLower <= tickCurrent : tickUpper >= tickCurrent

  const priceLower = tickToPrice(baseCurrency, quoteCurrency, tickLower)
  const priceUpper = tickToPrice(baseCurrency, quoteCurrency, tickUpper)

  // Sqrt price = sqrt(priceLower * priceUpper)
  const sqrtPrice = BN(priceLower.toFixed(18))
    .multipliedBy(BN(priceUpper.toFixed(18)))
    .sqrt()

  return { sqrtPrice, isSellingOrBuyingAtWorsePrice, tickLower, tickUpper, targetTick, priceLower, priceUpper }
}

export function getSqrtPriceFromCurrentTick({
  zeroForOne,
  tickCurrent,
  tickSpacing,
  inputCurrency,
  outputCurrency,
}: {
  zeroForOne: boolean
  tickCurrent: number
  tickSpacing: number
  inputCurrency: Currency
  outputCurrency: Currency
}) {
  let tickLower: number
  let tickUpper: number

  if (zeroForOne) {
    // Adjust ticks above the current tick
    tickLower = nearestUsableTick(tickCurrent + tickSpacing, tickSpacing)
    if (tickLower <= tickCurrent) {
      tickLower += tickSpacing
    }
    tickUpper = nearestUsableTick(tickCurrent + tickSpacing * 2, tickSpacing)
    if (tickUpper <= tickCurrent) {
      tickUpper += tickSpacing
    }
  } else {
    // zeroForOne is false
    // Adjust ticks below the current tick
    tickUpper = nearestUsableTick(tickCurrent - tickSpacing, tickSpacing)
    if (tickUpper >= tickCurrent) {
      tickUpper -= tickSpacing
    }
    tickLower = nearestUsableTick(tickCurrent - tickSpacing * 2, tickSpacing)
    if (tickLower >= tickCurrent) {
      tickLower -= tickSpacing
    }
  }

  const priceLower = tickToPrice(inputCurrency, outputCurrency, tickLower)
  const priceUpper = tickToPrice(inputCurrency, outputCurrency, tickUpper)

  const sqrtPrice = BN(priceLower.toFixed(18))
    .multipliedBy(BN(priceUpper.toFixed(18)))
    .sqrt()

  return { sqrtPrice, tickLower, tickUpper, priceLower, priceUpper }
}
