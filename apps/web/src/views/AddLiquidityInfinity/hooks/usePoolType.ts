import { PoolType } from '@pancakeswap/infinity-sdk'
import { usePoolById } from 'hooks/infinity/usePool'
import { Hex } from 'viem'

type UsePoolTypeParams = {
  poolId: Hex | undefined
  chainId: number | undefined
}
export const usePoolType = ({ poolId, chainId }: UsePoolTypeParams): PoolType | undefined => {
  const [, pool] = usePoolById(poolId, chainId)

  return pool?.poolType
}
