import { usePreviousValue } from '@pancakeswap/hooks'
import { getCurrencyPriceFromId } from '@pancakeswap/infinity-sdk'
import { Currency, Price } from '@pancakeswap/swap-sdk-core'
import { isSolana } from '@pancakeswap/chains'
import BigNumber from 'bignumber.js'
import { tryParsePrice } from 'hooks/v3/utils'
import { useMemo } from 'react'
import { useStartingPriceQueryState } from 'state/infinity/create'
import { useInverted } from 'state/infinity/shared'
import { useCurrencies } from './useCurrencies'
import {
  useInfinityBinQueryState,
  useInfinityCreateFormQueryState,
} from './useInfinityFormState/useInfinityFormQueryState'

export const useStartPriceAsFraction = () => {
  const { isBin } = useInfinityCreateFormQueryState()
  const [startPrice] = useStartingPriceQueryState()
  const { activeId, binStep } = useInfinityBinQueryState()
  const { currency0, currency1 } = useCurrencies()
  const [inverted] = useInverted()
  const prevInverted = usePreviousValue(inverted)

  return useMemo(() => {
    if (!currency0 || !currency1) return undefined

    if (isBin) {
      if (activeId === null || binStep === null) return null

      const price = getCurrencyPriceFromId(
        activeId,
        binStep,
        currency0 as unknown as Currency,
        currency1 as unknown as Currency,
      )
      return inverted ? price.invert() : price
    }

    let price: Price<Currency, Currency> | undefined

    const formattedStartPrice = new BigNumber(startPrice ?? 0).toJSON()

    const c0 = !isSolana(currency0.chainId) ? (currency0 as unknown as Currency) : undefined
    const c1 = !isSolana(currency1.chainId) ? (currency1 as unknown as Currency) : undefined

    if (prevInverted !== inverted) {
      price = prevInverted ? tryParsePrice(c1, c0, formattedStartPrice) : tryParsePrice(c0, c1, formattedStartPrice)
      return price?.invert()
    }
    return inverted ? tryParsePrice(c1, c0, formattedStartPrice) : tryParsePrice(c0, c1, formattedStartPrice)
  }, [currency0, currency1, isBin, prevInverted, startPrice, activeId, binStep, inverted])
}
