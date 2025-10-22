import { getIsInitializedByPoolKey, PoolKey } from '@pancakeswap/infinity-sdk'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { publicClient } from 'utils/viem'

export const useIsPoolInitialized = (poolKey: PoolKey | undefined, chainId: number | undefined) => {
  const client = useMemo(() => (chainId ? publicClient({ chainId }) : undefined), [chainId])
  return useQuery({
    queryKey: ['isPoolInitialized', poolKey],
    queryFn: () => getIsInitializedByPoolKey(client!, poolKey!),
    enabled: !!poolKey && !!client,
  })
}
