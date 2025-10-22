import { Currency, Price, sortCurrencies } from '@pancakeswap/swap-sdk-core'
import { nearestUsableTick, tickToPrice } from '@pancakeswap/v3-sdk'
import { Bound } from '@pancakeswap/widgets-internal'
import { useEffect, useMemo } from 'react'
import { useClRangeQueryState, useInverted } from 'state/infinity/shared'
import { formatRangeSelectorPrice } from 'utils/formatRangeSelectorPrice'
import { useTicksAtLimit } from 'views/AddLiquidityInfinity/hooks/useTicksAtLimit'

export const useCLPriceRange = (
  baseCurrency: Currency | undefined,
  quoteCurrency: Currency | undefined,
  tickSpacing: number | undefined,
  priceFormatter: (price?: Price<Currency, Currency>) => string = formatRangeSelectorPrice,
) => {
  const [inverted] = useInverted()
  const [{ lowerTick, upperTick }, setTick] = useClRangeQueryState()
  const [currency0, currency1] = useMemo(() => {
    if (!baseCurrency || !quoteCurrency) return [undefined, undefined]
    return sortCurrencies([baseCurrency, quoteCurrency])
  }, [baseCurrency, quoteCurrency])

  const ticksAtLimit = useTicksAtLimit(tickSpacing)

  useEffect(() => {
    if (lowerTick && tickSpacing && lowerTick % tickSpacing !== 0) {
      setTick({ lowerTick: nearestUsableTick(lowerTick, tickSpacing) })
    }
    if (upperTick && tickSpacing && upperTick % tickSpacing !== 0) {
      setTick({ upperTick: nearestUsableTick(upperTick, tickSpacing) })
    }
  }, [lowerTick, setTick, tickSpacing, upperTick])

  const [lowerPrice, upperPrice] = useMemo(() => {
    if (!currency0 || !currency1) return [undefined, undefined]
    let lowerPrice_: Price<Currency, Currency> | undefined
    let upperPrice_: Price<Currency, Currency> | undefined

    if (lowerTick !== null) {
      lowerPrice_ = tickToPrice(currency0, currency1, lowerTick)
    }
    if (upperTick !== null) {
      upperPrice_ = tickToPrice(currency0, currency1, upperTick)
    }
    return [lowerPrice_, upperPrice_]
  }, [currency0, currency1, lowerTick, upperTick])

  const [minPrice, maxPrice] = useMemo(() => {
    if (!currency0 || !currency1) return ['', '']

    let minPrice_: string | undefined
    let maxPrice_: string | undefined

    if (lowerPrice) {
      if (inverted) {
        maxPrice_ = priceFormatter(lowerPrice.invert())
      } else {
        minPrice_ = priceFormatter(lowerPrice)
      }
    }

    if (upperPrice) {
      if (inverted) {
        minPrice_ = priceFormatter(upperPrice?.invert())
      } else {
        maxPrice_ = priceFormatter(upperPrice)
      }
    }

    if (ticksAtLimit[Bound.LOWER] && lowerTick !== null) {
      if (inverted) {
        maxPrice_ = '∞'
      } else {
        minPrice_ = '0'
      }
    }
    if (ticksAtLimit[Bound.UPPER] && upperTick !== null) {
      if (inverted) {
        minPrice_ = '0'
      } else {
        maxPrice_ = '∞'
      }
    }

    return [minPrice_, maxPrice_]
  }, [currency0, currency1, lowerPrice, upperPrice, ticksAtLimit, lowerTick, upperTick, inverted, priceFormatter])

  return { minPrice, maxPrice, lowerPrice, upperPrice }
}
