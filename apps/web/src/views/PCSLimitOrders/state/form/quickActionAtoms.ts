import { atom } from 'jotai'
import { BigNumber as BN } from 'bignumber.js'
import { DEFAULT_PERCENTAGE_MAP } from 'views/PCSLimitOrders/constants'
import { getSqrtPriceFromMarketPrice } from 'views/PCSLimitOrders/utils/ticks'
import { getSymbolDecimals } from 'views/PCSLimitOrders/constants/decimalConfig'
import { inputCurrencyAtom, outputCurrencyAtom } from '../currency/currencyAtoms'
import { selectedPoolAtom } from '../pools/selectedPoolAtom'
import { customMarketPriceAtom } from './customMarketPriceAtom'
import { currentMarketPriceAtom } from './currentMarketPriceAtom'

export const differencePercentageAtom = atom((get) => {
  const customMarketPrice = get(customMarketPriceAtom)
  if (!customMarketPrice) return undefined

  const currentMarketPrice = get(currentMarketPriceAtom)
  if (!currentMarketPrice) return undefined

  if (customMarketPrice === currentMarketPrice) return undefined

  const customMarketPriceBN = BN(customMarketPrice)
  const currentMarketPriceBN = BN(currentMarketPrice)

  const difference = customMarketPriceBN.minus(currentMarketPriceBN)
  const percentage = difference.dividedBy(currentMarketPriceBN).multipliedBy(100)

  return percentage.toFormat(2)
})

export const setPercentDifferenceAtom = atom(null, async (get, set, percent: number) => {
  if (!percent) return

  const currentMarketPrice = await get(currentMarketPriceAtom)
  if (!currentMarketPrice) return

  const inputCurrency = get(inputCurrencyAtom)
  const outputCurrency = get(outputCurrencyAtom)

  if (!inputCurrency || !outputCurrency) return

  const { data: selectedPool } = get(selectedPoolAtom)
  if (!selectedPool) return

  const {
    pool: { tickSpacing, tickCurrent },
    zeroForOne,
  } = selectedPool

  const calculatedPrice = BN(currentMarketPrice).multipliedBy(BN(1).plus(BN(percent).dividedBy(100)))

  const sqrtPriceData = getSqrtPriceFromMarketPrice(
    calculatedPrice.toString(),
    inputCurrency,
    outputCurrency,
    tickSpacing,
    tickCurrent,
    zeroForOne,
  )

  if (!sqrtPriceData) return

  const { sqrtPrice } = sqrtPriceData

  if (!sqrtPrice.isFinite() || sqrtPrice.isZero()) return

  set(customMarketPriceAtom, sqrtPrice.toFixed(getSymbolDecimals(outputCurrency.symbol)))
})

// Preset percentage values
// For example, if selecting 1% results in tick-adjusted price at 0.98%, then 1% button should
// be considered active if percentage is 0.98%
export const presetPercentMapAtom = atom((get) => {
  const currentMarketPrice = get(currentMarketPriceAtom)
  if (!currentMarketPrice) return DEFAULT_PERCENTAGE_MAP

  const inputCurrency = get(inputCurrencyAtom)
  const outputCurrency = get(outputCurrencyAtom)

  if (!inputCurrency || !outputCurrency) return DEFAULT_PERCENTAGE_MAP

  const { data: selectedPool } = get(selectedPoolAtom)
  if (!selectedPool) return DEFAULT_PERCENTAGE_MAP

  const {
    pool: { tickSpacing, tickCurrent },
    zeroForOne,
  } = selectedPool

  const percentages = Object.keys(DEFAULT_PERCENTAGE_MAP)

  const percentMap: Record<keyof typeof DEFAULT_PERCENTAGE_MAP, string> = DEFAULT_PERCENTAGE_MAP

  percentages.forEach((percent) => {
    const calculatedPrice = BN(currentMarketPrice).multipliedBy(BN(1).plus(BN(percent).dividedBy(100)))

    const sqrtPriceData = getSqrtPriceFromMarketPrice(
      calculatedPrice.toString(),
      inputCurrency,
      outputCurrency,
      tickSpacing,
      tickCurrent,
      zeroForOne,
    )
    if (!sqrtPriceData) return

    const { sqrtPrice } = sqrtPriceData

    if (!sqrtPrice.isFinite() || sqrtPrice.isZero()) return

    const difference = BN(sqrtPrice.toFixed(getSymbolDecimals(outputCurrency.symbol))).minus(BN(currentMarketPrice))
    const newPercentage = BN(difference).dividedBy(currentMarketPrice).multipliedBy(100)

    percentMap[percent] = newPercentage.toFormat(2)
  })

  return percentMap
})
