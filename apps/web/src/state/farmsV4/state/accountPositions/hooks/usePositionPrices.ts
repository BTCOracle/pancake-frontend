import { Currency, isCurrencySorted } from '@pancakeswap/sdk'
import { tickToPrice } from '@pancakeswap/v3-sdk'
import { useCallback, useMemo, useState } from 'react'

interface PositionInfo {
  currencyA?: Currency
  currencyB?: Currency
  tickLower?: number
  tickUpper?: number
  tickCurrent?: number
}

export function usePositionPrices({
  currencyA: initialBaseCurrency,
  currencyB: initialQuoteCurrency,
  tickLower,
  tickUpper,
  tickCurrent,
}: PositionInfo) {
  const [invert, setInvert] = useState(false)
  const toggleInvert = useCallback(() => setInvert(!invert), [invert])
  const currencyA = useMemo(
    () => (invert ? initialQuoteCurrency : initialBaseCurrency),
    [invert, initialBaseCurrency, initialQuoteCurrency],
  )
  const currencyB = useMemo(
    () => (invert ? initialBaseCurrency : initialQuoteCurrency),
    [invert, initialBaseCurrency, initialQuoteCurrency],
  )

  const sorted = useMemo(() => currencyA && currencyB && isCurrencySorted(currencyA, currencyB), [currencyA, currencyB])

  const tickLowerPrice = useMemo(
    () =>
      currencyA && currencyB && typeof tickLower === 'number'
        ? tickToPrice(currencyA, currencyB, tickLower)
        : undefined,
    [tickLower, currencyA, currencyB],
  )
  const tickUpperPrice = useMemo(
    () =>
      currencyA && currencyB && typeof tickUpper === 'number'
        ? tickToPrice(currencyA, currencyB, tickUpper)
        : undefined,
    [tickUpper, currencyA, currencyB],
  )
  const [priceLower, priceUpper] = useMemo(
    () => (sorted ? [tickLowerPrice, tickUpperPrice] : [tickUpperPrice, tickLowerPrice]),
    [sorted, tickLowerPrice, tickUpperPrice],
  )
  const priceCurrent = useMemo(
    () =>
      currencyA && currencyB && typeof tickCurrent === 'number'
        ? tickToPrice(currencyA, currencyB, tickCurrent)
        : undefined,
    [tickCurrent, currencyA, currencyB],
  )

  return {
    currencyA,
    currencyB,
    priceLower,
    priceUpper,
    priceCurrent,
    invert: toggleInvert,
    inverted: invert,
  }
}
