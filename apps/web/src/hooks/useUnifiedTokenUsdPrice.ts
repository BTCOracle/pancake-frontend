import { useMemo } from 'react'
import { ChainId, NonEVMChainId } from '@pancakeswap/chains'
import { Currency, UnifiedCurrency } from '@pancakeswap/sdk'

import { useCurrencyUsdPrice } from './useCurrencyUsdPrice'
import { useSolanaTokenPrice } from './solana/useSolanaTokenPrice'

export function useUnifiedTokenUsdPrice(currency?: UnifiedCurrency, enabled: boolean = true) {
  const isSolana = currency?.chainId === NonEVMChainId.SOLANA
  const isEvm = currency?.chainId && currency?.chainId in ChainId

  const evmPrice = useCurrencyUsdPrice(isEvm ? (currency as Currency) : undefined, { enabled })
  const solanaPriceResult = useSolanaTokenPrice({
    mint: isSolana ? currency.wrapped.address : undefined,
    enabled,
  })

  return useMemo(() => {
    if (isEvm) {
      return evmPrice
    }
    if (isSolana) {
      return {
        data: solanaPriceResult.data ?? 0,
        isLoading: solanaPriceResult.isLoading,
        error: solanaPriceResult.error,
      }
    }
    return { data: 0, isLoading: false, error: undefined }
  }, [evmPrice, isEvm, isSolana, solanaPriceResult.data, solanaPriceResult.error, solanaPriceResult.isLoading])
}
