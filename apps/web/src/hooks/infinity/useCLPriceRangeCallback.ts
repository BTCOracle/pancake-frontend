import { Currency, isCurrencySorted, Price, sortCurrencies } from '@pancakeswap/swap-sdk-core'
import { nearestUsableTick } from '@pancakeswap/v3-sdk'
import { ZoomLevels } from '@pancakeswap/widgets-internal/liquidity/infinity/constants'
import BigNumber from 'bignumber.js'
import { tryParseTick } from 'hooks/infinity/utils'
import { tryParsePrice } from 'hooks/v3/utils'
import { useCallback, useMemo, useState } from 'react'
import { useClRangeQueryState } from 'state/infinity/shared'
import { useTicksLimit } from 'views/AddLiquidityInfinity/hooks/useTicksAtLimit'

export const useCLPriceRangeCallback = (
  baseCurrency: Currency | undefined,
  quoteCurrency: Currency | undefined,
  tickSpacing: number | null | undefined,
  currentPrice: Price<Currency, Currency> | undefined | null,
): {
  onLowerIncrement: () => void
  onLowerDecrement: () => void
  onUpperIncrement: () => void
  onUpperDecrement: () => void
  onLowerUserInput: (value: string | undefined) => void
  onUpperUserInput: (value: string | undefined) => void
  quickAction: number | null
  handleQuickAction: (value: number | null, zoomLevel: ZoomLevels) => void
} => {
  const [{ lowerTick, upperTick }, setClQueryState] = useClRangeQueryState()

  const [currency0, currency1] = useMemo(() => {
    if (!baseCurrency || !quoteCurrency) return [undefined, undefined]
    return sortCurrencies([baseCurrency, quoteCurrency])
  }, [baseCurrency, quoteCurrency])

  const onLowerIncrement = useCallback(() => {
    if (lowerTick === null || !tickSpacing) return
    setQuickAction(null)
    setClQueryState({ lowerTick: nearestUsableTick(lowerTick + tickSpacing, tickSpacing) })
  }, [lowerTick, tickSpacing, setClQueryState])

  const onLowerDecrement = useCallback(() => {
    if (lowerTick === null || !tickSpacing) return
    setQuickAction(null)
    setClQueryState({ lowerTick: nearestUsableTick(lowerTick - tickSpacing, tickSpacing) })
  }, [lowerTick, tickSpacing, setClQueryState])

  const onUpperIncrement = useCallback(() => {
    if (upperTick === null || !tickSpacing) return
    setQuickAction(null)
    setClQueryState({ upperTick: nearestUsableTick(upperTick + tickSpacing, tickSpacing) })
  }, [upperTick, tickSpacing, setClQueryState])

  const onUpperDecrement = useCallback(() => {
    if (upperTick === null || !tickSpacing) return
    setQuickAction(null)
    setClQueryState({ upperTick: nearestUsableTick(upperTick - tickSpacing, tickSpacing) })
  }, [upperTick, tickSpacing, setClQueryState])

  const onLowerUserInput = useCallback(
    (value: string | undefined) => {
      if (!tickSpacing || !baseCurrency || !quoteCurrency) return
      setQuickAction(null)
      if (value === '') {
        setClQueryState({ lowerTick: null })
        return
      }
      let price = tryParsePrice(baseCurrency, quoteCurrency, value)
      if (typeof price === 'undefined') return
      if (!isCurrencySorted(baseCurrency, quoteCurrency)) {
        price = price.invert()
      }
      const tick = tryParseTick(price, tickSpacing)
      if (typeof tick === 'undefined') return
      setClQueryState({ lowerTick: tick })
    },
    [tickSpacing, setClQueryState, baseCurrency, quoteCurrency],
  )

  const onUpperUserInput = useCallback(
    (value: string | undefined) => {
      if (!tickSpacing || !baseCurrency || !quoteCurrency) return
      setQuickAction(null)
      if (value === '') {
        setClQueryState({ upperTick: null })
        return
      }
      let price = tryParsePrice(baseCurrency, quoteCurrency, value)
      if (typeof price === 'undefined') return
      if (!isCurrencySorted(baseCurrency, quoteCurrency)) {
        price = price.invert()
      }
      const tick = tryParseTick(price, tickSpacing)
      if (typeof tick === 'undefined') return
      setClQueryState({ upperTick: tick })
    },
    [tickSpacing, baseCurrency, quoteCurrency, setClQueryState],
  )

  const [quickAction, setQuickAction] = useState<number | null>(null)
  const ticksLimit = useTicksLimit(tickSpacing ?? undefined)

  const handleQuickAction = useCallback(
    (value: number | null, zoomLevel: ZoomLevels) => {
      if (!tickSpacing || !currency0 || !currency1 || !currentPrice || currentPrice.equalTo(0)) return

      setQuickAction(value)

      // full range
      if (value === 100) {
        setClQueryState({ lowerTick: ticksLimit.LOWER, upperTick: ticksLimit.UPPER })
        return
      }

      const { initialMin, initialMax } = zoomLevel

      const p = isCurrencySorted(currentPrice.baseCurrency, currentPrice.quoteCurrency)
        ? currentPrice
        : currentPrice.invert()

      const initialMinPrice = tryParsePrice(
        currency0,
        currency1,
        new BigNumber(p.denominator ? p.toFixed(18) : 0).times(initialMin ?? 1).toString(),
      )
      const initialMaxPrice = tryParsePrice(
        currency0,
        currency1,
        new BigNumber(p.denominator ? p.toFixed(18) : 0).times(initialMax ?? 1).toString(),
      )
      if (!initialMinPrice || !initialMaxPrice) {
        return
      }
      const lowTick = tryParseTick(initialMinPrice, tickSpacing)
      const upTick = tryParseTick(initialMaxPrice, tickSpacing)

      setClQueryState({ lowerTick: lowTick, upperTick: upTick })
    },
    [currentPrice, currency0, currency1, setClQueryState, tickSpacing, ticksLimit],
  )

  return {
    onLowerIncrement,
    onLowerDecrement,
    onUpperIncrement,
    onUpperDecrement,
    onLowerUserInput,
    onUpperUserInput,
    quickAction,
    handleQuickAction,
  }
}
