import { NonEVMChainId } from '@pancakeswap/chains'
import { PoolTypeItem } from '@pancakeswap/solana-core-sdk'
import { useQuery } from '@tanstack/react-query'
import { CHAIN_QUERY_NAME } from 'config/chains'
import { QUERY_SETTINGS_IMMUTABLE } from 'config/constants'
import { useMemo } from 'react'
import { SolanaV3PoolInfo } from 'state/farmsV4/state/type'
import { solExplorerApiClient } from 'state/info/api/client'
import { components } from 'state/info/api/schema'
import { normalizeSolanaPoolInfo } from 'utils/normalizeSolanaPoolInfo'
import { fetchedPoolData } from 'views/V3Info/data/pool/poolData'

const fetchSolanaPoolInfo = async (poolId: string, signal?: AbortSignal) => {
  try {
    const resp = await solExplorerApiClient.GET('/cached/v1/pools/info/ids', {
      signal,
      params: {
        query: {
          ids: poolId,
        },
      },
    })
    const pool = resp.data?.data?.[0]
    return pool
      ? {
          ...pool,
          pooltype: [] as PoolTypeItem[],
          config: { ...pool.config, description: '' },
        }
      : null
  } catch (error) {
    console.error('Error fetching Solana pool info:', error)
    throw error
  }
}

export const useSolanaPoolInfo = (
  poolId: string | undefined,
  chainId: number | undefined,
): {
  data: SolanaV3PoolInfo | null
  isLoading: boolean
  error: Error | null
} => {
  const isSolana = chainId === NonEVMChainId.SOLANA

  const {
    data: solanaPoolInfo,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['solanaPoolInfo', poolId, chainId],
    queryFn: async ({ signal }) => {
      if (!poolId || !isSolana) {
        return null
      }
      const pool = await fetchSolanaPoolInfo(poolId)
      const { data: extraInfo } = await fetchedPoolData(
        CHAIN_QUERY_NAME[chainId!] as components['schemas']['ChainName'],
        poolId,
        signal,
      )
      if (!pool || !extraInfo) {
        return null
      }
      return Object.assign(pool, {
        volumeUSD24h: extraInfo.volumeUSD.toString(),
        volumeUSD48h: extraInfo.volumeUSD48h,
        tvlUSD: extraInfo.tvlUSD.toString(),
        tvlUSD24h: extraInfo.tvlUSD24h,
      })
    },
    enabled: Boolean(poolId && isSolana && chainId),
    retry: 3,
    retryDelay: 1000,
    ...QUERY_SETTINGS_IMMUTABLE,
  })

  // Convert Solana pool data to match EVM pool info structure
  const convertedPoolInfo = useMemo(() => {
    if (!solanaPoolInfo || !isSolana) return null
    return normalizeSolanaPoolInfo(solanaPoolInfo)
  }, [solanaPoolInfo, isSolana])

  return {
    data: convertedPoolInfo,
    isLoading,
    error,
  }
}
