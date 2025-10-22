import type { ChainId } from '@pancakeswap/chains'
import { type PoolKey, type PoolType, decodeCLPoolParameters } from '@pancakeswap/infinity-sdk'
import { useQuery } from '@tanstack/react-query'
import { getInfinityCLPositionManagerContract } from '../../../utils/contractHelpers'

const getPosition = async (chainId: ChainId, poolType: PoolType, tokenId: bigint) => {
  if (poolType === 'Bin') {
    throw new Error('Bin pool not implemented')
  }

  const clPM = getInfinityCLPositionManagerContract(undefined, chainId)
  const position = await clPM.read.positions([tokenId])

  const [poolKey, tickLower, tickUpper, liquidity, feeGrowthInside0LastX128, feeGrowthInside1LastX128] = position

  return {
    poolKey: {
      ...poolKey,
      parameters: decodeCLPoolParameters(poolKey.parameters),
    } satisfies PoolKey<'CL'>,
    tickLower,
    tickUpper,
    liquidity,
    feeGrowthInside0LastX128,
    feeGrowthInside1LastX128,
  }
}

export const usePosition = (chainId: ChainId, poolType: PoolType, tokenId: bigint) => {
  return useQuery({
    queryKey: ['poolAndPositionInfo', poolType, tokenId?.toString()],
    queryFn: () => getPosition(chainId, poolType, tokenId),
    enabled: !!poolType && !!tokenId,
  })
}
