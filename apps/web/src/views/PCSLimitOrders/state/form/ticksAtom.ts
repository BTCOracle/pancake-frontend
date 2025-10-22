import { atom } from 'jotai'
import { getSqrtPriceFromCurrentTick, getSqrtPriceFromMarketPrice } from 'views/PCSLimitOrders/utils/ticks'
import { selectedPoolAtom } from '../pools/selectedPoolAtom'
import { customMarketPriceAtom } from './customMarketPriceAtom'
import { inputCurrencyAtom, outputCurrencyAtom } from '../currency/currencyAtoms'

/**
 * Ticks derived from current/custom market price
 */
export const ticksAtom = atom((get) => {
  const inputCurrency = get(inputCurrencyAtom)
  const outputCurrency = get(outputCurrencyAtom)

  if (!inputCurrency || !outputCurrency) return undefined

  const { data: selectedPool } = get(selectedPoolAtom)
  if (!selectedPool || !selectedPool.pool) return undefined

  const {
    pool: { tickSpacing, tickCurrent },
    zeroForOne,
  } = selectedPool

  // Get price for limit order
  const customMarketPrice = get(customMarketPriceAtom)

  if (customMarketPrice) {
    const sqrtPriceData = getSqrtPriceFromMarketPrice(
      customMarketPrice,
      inputCurrency,
      outputCurrency,
      tickSpacing,
      tickCurrent,
      zeroForOne,
    )
    if (!sqrtPriceData) return undefined

    const { sqrtPrice, tickLower, tickUpper, priceLower, priceUpper, targetTick, isSellingOrBuyingAtWorsePrice } =
      sqrtPriceData

    return {
      sqrtPrice,
      tickLower,
      tickUpper,
      priceLower,
      priceUpper,
      targetTick,
      zeroForOne,
      isSellingOrBuyingAtWorsePrice,
    }
  }

  // If custom market price is not set, use current market price
  const { tickLower, tickUpper, priceLower, priceUpper, sqrtPrice } = getSqrtPriceFromCurrentTick({
    zeroForOne,
    tickCurrent,
    tickSpacing,
    inputCurrency,
    outputCurrency,
  })

  return {
    tickLower,
    tickUpper,
    zeroForOne,
    sqrtPrice,
    priceLower,
    priceUpper,
    // False because we already adjusted ticks for best price for this case
    isSellingOrBuyingAtWorsePrice: false,
  }
})
