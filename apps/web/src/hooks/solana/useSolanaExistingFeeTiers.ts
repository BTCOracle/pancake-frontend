import { useMemo } from 'react'
import { useSolanaPoolsByMint } from './useSolanaPoolsByMint'

export const useSolanaExistingFeeTiers = (token0?: string, token1?: string, enabled: boolean = false) => {
  const { data: pools } = useSolanaPoolsByMint(token0, token1, enabled)
  return useMemo(() => {
    if (!pools?.length) return new Set<number>()
    const tiers = pools
      .map((p) => p?.config?.tradeFeeRate ?? p?.feeRate)
      .filter((v): v is number => typeof v === 'number' && !Number.isNaN(v))
    return new Set(tiers)
  }, [pools])
}
