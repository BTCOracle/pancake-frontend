import { useActiveChainId } from 'hooks/useAccountActiveChain'
import { NonEVMChainId } from '@pancakeswap/chains'
import { useCallback, useMemo } from 'react'
import { tryParsePrice } from 'hooks/v3/utils'
import { TickUtils } from '@pancakeswap/solana-core-sdk'
import Decimal from 'decimal.js'
import { useClmmAmmConfigs } from './useClmmAmmConfigs'

/**
 * Returns a function that, for Solana, snaps an input price to the nearest usable tick
 * using CLMM AMM config tick spacing, and returns both the snapped tick and price.
 * For non-Solana chains or missing data, it returns undefined.
 */
export const useGetPriceAndTick = (baseCurrency?: any, quoteCurrency?: any, feeAmount?: number | null) => {
  const { chainId } = useActiveChainId()
  const ammConfigs = useClmmAmmConfigs()

  const tickSpacing = useMemo(() => {
    if (chainId !== NonEVMChainId.SOLANA || !feeAmount) return undefined
    const candidates = Object.values(ammConfigs).filter((c) => c.tradeFeeRate === Number(feeAmount))
    if (!candidates.length) return undefined
    return Math.min(...candidates.map((c) => c.tickSpacing))
  }, [ammConfigs, chainId, feeAmount])

  return useCallback(
    (val: string) => {
      if (chainId !== NonEVMChainId.SOLANA || !tickSpacing) return undefined
      const base = baseCurrency?.wrapped ?? baseCurrency
      const quote = quoteCurrency?.wrapped ?? quoteCurrency
      const parsed = tryParsePrice(base, quote, val)
      if (!parsed) return undefined
      try {
        // Build minimal poolInfo for TickUtils
        const poolInfo = {
          config: { tickSpacing },
          mintA: { decimals: base?.decimals ?? 9 },
          mintB: { decimals: quote?.decimals ?? 9 },
        } as any

        const decPrice = new Decimal(parsed.toFixed ? parsed.toFixed(18) : String(val))
        const r = TickUtils.getPriceAndTick({
          poolInfo,
          price: decPrice,
          baseIn: true,
        })
        // Convert Decimal to v3 Price via tryParsePrice for web form
        const snapped = tryParsePrice(base, quote, r.price.toString?.() ?? String(r.price))
        return snapped ? { tick: r.tick, price: snapped } : undefined
      } catch {
        return undefined
      }
    },
    [chainId, tickSpacing, baseCurrency, quoteCurrency],
  )
}
