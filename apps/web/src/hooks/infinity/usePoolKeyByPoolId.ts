import {
  INFINITY_SUPPORTED_CHAINS,
  PoolType,
  poolIdToPoolKey,
  type InfinitySupportedChains,
} from '@pancakeswap/infinity-sdk'
import { useQuery } from '@tanstack/react-query'
import { type Hex } from 'viem'
import { useIsFarmSearchContext } from 'views/universalFarms/hooks/useFarmSearchContext'
import { usePublicClient } from 'wagmi'

export const usePoolKeyByPoolId = (
  poolId: Hex | undefined,
  chainId: number | undefined,
  poolType?: PoolType | undefined,
) => {
  const publicClient = usePublicClient({ chainId })
  const isFarmContext = useIsFarmSearchContext()
  return useQuery({
    queryKey: ['poolKeyByPoolId', chainId, poolId],
    queryFn: () =>
      poolIdToPoolKey({
        poolId,
        publicClient,
        poolType,
      }),
    enabled:
      !isFarmContext &&
      !!chainId &&
      !!poolId &&
      INFINITY_SUPPORTED_CHAINS.includes(chainId as InfinitySupportedChains) &&
      !!publicClient,
  })
}
