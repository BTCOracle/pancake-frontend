import { getBestSolanaTrade } from '@pancakeswap/solana-router-sdk'
import { solanaTokens } from '@pancakeswap/tokens'
import { useQuery } from '@tanstack/react-query'
import { TradeType, SPLToken, UnifiedCurrencyAmount } from '@pancakeswap/swap-sdk-core'
import BigNumber from 'bignumber.js'
import { useMemo } from 'react'
import toNumber from 'lodash/toNumber'

export function useDirectBestSolanaTrade(missingMints: SPLToken[]) {
  const { data, isLoading } = useQuery({
    queryKey: ['svm-fallback-prices', missingMints.slice().sort().join(',')],
    enabled: missingMints.length > 0,
    queryFn: async () => {
      const { usdc } = solanaTokens

      const tasks = missingMints
        .map(async (inputCurrency) => {
          if (!inputCurrency) return undefined

          if (inputCurrency.address === usdc.address) return undefined

          const inputRaw = new BigNumber(10).pow(inputCurrency.decimals).toFixed(0)

          try {
            const trade = await getBestSolanaTrade({
              inputCurrency,
              outputCurrency: usdc,
              amount: UnifiedCurrencyAmount.fromRawAmount(inputCurrency, inputRaw),
              tradeType: TradeType.EXACT_INPUT,
            })

            return {
              mint: inputCurrency.address,
              price: toNumber(trade?.outputAmount.toSignificant(6)) ?? 0,
            }
          } catch (error) {
            return undefined
          }
        })
        .filter((t) => t !== undefined)
      const results = await Promise.allSettled(tasks)
      const map: Record<string, number> = {}
      for (const r of results) {
        if (r.status === 'fulfilled' && r.value && Number.isFinite(r.value.price)) {
          map[r.value.mint] = r.value.price
        }
      }
      return map
    },
  })

  return useMemo(
    () => ({ fallbackPriceMap: (data as Record<string, number>) || {}, isFallbackLoading: isLoading }),
    [data, isLoading],
  )
}
