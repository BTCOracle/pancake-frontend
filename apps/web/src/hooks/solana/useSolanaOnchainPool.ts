import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Raydium } from '@pancakeswap/solana-core-sdk'
import { useRaydium } from './useRaydium'

export type SolanaOnchainClmmPoolData = Awaited<ReturnType<InstanceType<typeof Raydium>['clmm']['getPoolInfoFromRpc']>>

export async function getSolanaOnchainClmmPool(raydium: Raydium, poolId: string) {
  return raydium.clmm.getPoolInfoFromRpc(poolId)
}

export function useSolanaOnchainClmmPool(poolId?: string) {
  const raydium = useRaydium()

  const { data, isLoading, error } = useQuery<SolanaOnchainClmmPoolData>({
    queryKey: ['solanaOnchainPoolInfo', poolId],
    enabled: Boolean(poolId && raydium),
    queryFn: async () => {
      if (!poolId || !raydium) throw new Error('poolId and raydium client required')
      return getSolanaOnchainClmmPool(raydium, poolId)
    },
    staleTime: 10_000,
  })

  return useMemo(() => ({ data, isLoading, error }), [data, isLoading, error])
}
