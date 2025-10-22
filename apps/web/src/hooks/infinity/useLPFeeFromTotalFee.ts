import {
  INFI_BIN_PROTOCOL_FEE_CONTROLLER_ADDRESSES,
  INFI_CL_PROTOCOL_FEE_CONTROLLER_ADDRESSES,
  POOL_TYPE,
  PoolType,
  ProtocolFeeControllerAbi,
} from '@pancakeswap/infinity-sdk'
import { UseQueryResult, useQuery } from '@tanstack/react-query'
import { publicClient } from 'utils/viem'

export const useLPFeeFromTotalFee = (
  chainId?: number,
  poolType?: PoolType,
  totalFee?: number | null,
): UseQueryResult<bigint | undefined> => {
  return useQuery({
    queryKey: ['getLPFeeFromTotalFee', chainId, poolType, totalFee],

    queryFn: () => {
      if (!chainId || !poolType || !totalFee) {
        return undefined
      }
      const args: [number] = [Number((totalFee * 1e4).toFixed(0))]
      if (poolType === POOL_TYPE.CLAMM) {
        return publicClient({ chainId }).readContract({
          abi: ProtocolFeeControllerAbi,
          address: INFI_CL_PROTOCOL_FEE_CONTROLLER_ADDRESSES[chainId],
          functionName: 'getLPFeeFromTotalFee',
          args,
        })
      }
      return publicClient({ chainId }).readContract({
        abi: ProtocolFeeControllerAbi,
        address: INFI_BIN_PROTOCOL_FEE_CONTROLLER_ADDRESSES[chainId],
        functionName: 'getLPFeeFromTotalFee',
        args,
      })
    },
    retry: true,
    refetchOnWindowFocus: false,
    enabled: Boolean(chainId && poolType && totalFee),
  })
}
