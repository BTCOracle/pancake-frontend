import { getIdFromCurrencyPrice } from '@pancakeswap/infinity-sdk'
import { Currency } from '@pancakeswap/swap-sdk-core'
import BigNumber from 'bignumber.js'
import { tryParsePrice } from 'hooks/v3/utils'
import { useCallback } from 'react'
import { useBinRangeQueryState, useInverted } from 'state/infinity/shared'

export const useBinPriceRangeCallback = ({
  currency0,
  currency1,
  binStep,
  callback,
  minBinId,
  maxBinId,
}: {
  currency0: Currency | undefined
  currency1: Currency | undefined
  binStep?: number | null
  minBinId?: number | null
  maxBinId?: number | null
  callback?: (key: 'lowerBinId' | 'upperBinId', value: number | null) => void
}): {
  onLowerIncrement: () => void
  onLowerDecrement: () => void
  onUpperIncrement: () => void
  onUpperDecrement: () => void
  onLowerUserInput: (value?: string) => void
  onUpperUserInput: (value?: string) => void
} => {
  const [inverted] = useInverted()
  const [{ lowerBinId, upperBinId }, setBinQueryState] = useBinRangeQueryState()

  const onLowerIncrement = useCallback(() => {
    if (lowerBinId === null) return

    setBinQueryState({ lowerBinId: lowerBinId + 1 })
    callback?.('lowerBinId', lowerBinId + 1)
  }, [callback, lowerBinId, setBinQueryState])

  const onLowerDecrement = useCallback(() => {
    if (lowerBinId === null) return

    setBinQueryState({ lowerBinId: lowerBinId - 1 })
    callback?.('lowerBinId', lowerBinId - 1)
  }, [callback, lowerBinId, setBinQueryState])

  const onUpperIncrement = useCallback(() => {
    if (upperBinId === null) return

    setBinQueryState({ upperBinId: upperBinId + 1 })
    callback?.('upperBinId', upperBinId + 1)
  }, [upperBinId, setBinQueryState, callback])

  const onUpperDecrement = useCallback(() => {
    if (upperBinId === null) return

    setBinQueryState({ upperBinId: upperBinId - 1 })
    callback?.('upperBinId', upperBinId - 1)
  }, [upperBinId, setBinQueryState, callback])

  const convertPriceToBinId = useCallback(
    (value: string) => {
      if (!binStep || value === null) return null
      let p = Number(value)
      if (inverted) {
        const price = new BigNumber(value ?? 0)
        const [intN, intD] = price.toFraction()
        p = intD.dividedBy(intN).toNumber()
      }
      const price = tryParsePrice(currency0, currency1, String(p))
      if (!price) return null
      return getIdFromCurrencyPrice(price, binStep)
    },
    [binStep, currency0, currency1, inverted],
  )

  const onLowerUserInput = useCallback(
    (value?: string) => {
      if (!binStep || typeof value === 'undefined' || value === null) return
      let binId = convertPriceToBinId(value)

      if (minBinId && binId && binId < minBinId) {
        binId = minBinId
      }

      setBinQueryState({ lowerBinId: binId })
      callback?.('lowerBinId', binId)
    },
    [binStep, callback, convertPriceToBinId, minBinId, setBinQueryState],
  )
  const onUpperUserInput = useCallback(
    (value?: string) => {
      if (!binStep || typeof value === 'undefined' || value === null) return
      let binId = convertPriceToBinId(value)

      if (maxBinId && binId && binId > maxBinId) {
        binId = maxBinId
      }

      setBinQueryState({ upperBinId: binId })
      callback?.('upperBinId', binId)
    },
    [binStep, callback, convertPriceToBinId, maxBinId, setBinQueryState],
  )

  return {
    onLowerIncrement,
    onLowerDecrement,
    onUpperIncrement,
    onUpperDecrement,
    onLowerUserInput,
    onUpperUserInput,
  }
}
