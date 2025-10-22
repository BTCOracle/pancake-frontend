import { atom } from 'jotai'
import { getSqrtPriceFromCurrentTick } from 'views/PCSLimitOrders/utils/ticks'
import { inputCurrencyAtom, outputCurrencyAtom } from '../currency/currencyAtoms'
import { selectedPoolAtom } from '../pools/selectedPoolAtom'

export const currentMarketPriceAtom = atom((get) => {
  const inputCurrency = get(inputCurrencyAtom)
  const outputCurrency = get(outputCurrencyAtom)

  if (!inputCurrency || !outputCurrency) return undefined

  const { data: selectedPool } = get(selectedPoolAtom)
  if (!selectedPool || !selectedPool.pool) return undefined

  const {
    pool: { tickSpacing, tickCurrent },
    zeroForOne,
  } = selectedPool

  const { sqrtPrice } = getSqrtPriceFromCurrentTick({
    zeroForOne,
    tickCurrent,
    tickSpacing,
    inputCurrency,
    outputCurrency,
  })

  if (!sqrtPrice.isFinite() || sqrtPrice.isZero()) return '0'

  return sqrtPrice.toFixed(6)
})
