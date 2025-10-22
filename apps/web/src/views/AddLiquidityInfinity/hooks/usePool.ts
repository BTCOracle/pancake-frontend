import { PoolType } from '@pancakeswap/infinity-sdk'
import { useInfinityPoolIdRouteParams } from 'hooks/dynamicRoute/usePoolIdRoute'
import { usePoolById } from 'hooks/infinity/usePool'

export const usePool = <T extends PoolType = PoolType>() => {
  const { poolId, chainId } = useInfinityPoolIdRouteParams()
  const [, pool] = usePoolById<T>(poolId, chainId)

  return pool
}
