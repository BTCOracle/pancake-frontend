import {
  INFI_BIN_PROTOCOL_FEE_CONTROLLER_ADDRESSES,
  INFI_CL_PROTOCOL_FEE_CONTROLLER_ADDRESSES,
  POOL_TYPE,
  PoolKey,
  PoolType,
  ProtocolFeeControllerAbi,
  encodePoolKey,
  getPoolId,
} from '@pancakeswap/infinity-sdk'
import { UseQueryResult, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { publicClient } from 'utils/viem'

export const useProtocolFeeForPool = (
  chainId?: number,
  poolType?: PoolType,
  poolKey?: PoolKey | null,
): UseQueryResult<number | undefined> => {
  const poolId = useMemo(() => (poolKey ? getPoolId(poolKey) : undefined), [poolKey])
  return useQuery({
    queryKey: ['useProtocolFeeForPool', chainId, poolType, poolId],

    queryFn: async () => {
      if (!chainId || !poolType || !poolId || !poolKey) {
        return undefined
      }
      const args = [encodePoolKey(poolKey)] as const
      const functionName = 'protocolFeeForPool'
      if (poolType === POOL_TYPE.CLAMM) {
        return publicClient({ chainId }).readContract({
          abi: ProtocolFeeControllerAbi,
          address: INFI_CL_PROTOCOL_FEE_CONTROLLER_ADDRESSES[chainId],
          functionName,
          args,
        }) as Promise<number>
      }
      return publicClient({ chainId }).readContract({
        abi: ProtocolFeeControllerAbi,
        address: INFI_BIN_PROTOCOL_FEE_CONTROLLER_ADDRESSES[chainId],
        functionName,
        args,
      }) as Promise<number>
    },
    /* eslint-disable no-bitwise */
    select: (data) => (data ? data & 0xfff : 0),
    retry: true,
    refetchOnWindowFocus: false,
    enabled: Boolean(chainId && poolType && poolId),
  })
}
