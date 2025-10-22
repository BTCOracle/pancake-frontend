import { PoolInfo } from '@pancakeswap/solana-clmm-sdk'
import { PoolTypeItem } from '@pancakeswap/solana-core-sdk'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { solExplorerApiClient } from 'state/info/api/client'
import { normalizeSolanaPoolInfo } from 'utils/normalizeSolanaPoolInfo'

export const useSolanaPoolsByMint = (token0?: string, token1?: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['solana-pools-by-mint', token0, token1],
    enabled: Boolean(token0 && token1 && enabled),
    queryFn: async () => {
      const resp = await solExplorerApiClient.GET('/cached/v1/pools/info/mint', {
        params: {
          query: {
            token0,
            token1,
            poolType: 'concentrated',
            sortType: 'desc',
          },
        },
      })
      return (resp.data?.data ?? []) satisfies PoolInfo[]
    },
  })
}

export const useSolanaPoolByMint = (token0?: string, token1?: string, feeAmount?: number) => {
  const { data: poolsByMint, isLoading, error, status } = useSolanaPoolsByMint(token0, token1)
  return useMemo(() => {
    const pool = poolsByMint?.find((p) => p.config.tradeFeeRate === feeAmount)
    return {
      status,
      isLoading,
      error,
      data: pool
        ? normalizeSolanaPoolInfo({
            ...pool,
            pooltype: [] as PoolTypeItem[],
            config: { ...pool.config, description: '' },
          })
        : undefined,
    }
  }, [poolsByMint, feeAmount, error, isLoading, status])
}
