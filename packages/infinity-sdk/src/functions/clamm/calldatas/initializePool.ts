import { encodeFunctionData } from 'viem'
import { CLPositionManagerAbi } from '../../../abis'
import { PoolKey } from '../../../types'
import { encodePoolKey } from '../../../utils'

export const encodeCLPositionManagerInitializePoolCalldata = (poolKey: PoolKey<'CL'>, sqrtPriceX96: bigint) => {
  return encodeFunctionData({
    abi: CLPositionManagerAbi,
    functionName: 'initializePool',
    args: [encodePoolKey(poolKey), sqrtPriceX96],
  })
}
