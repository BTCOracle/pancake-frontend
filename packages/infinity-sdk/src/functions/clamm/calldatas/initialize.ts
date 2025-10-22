import { encodeFunctionData } from 'viem'
import { CLPoolManagerAbi } from '../../../abis'
import { PoolKey } from '../../../types'
import { encodePoolKey } from '../../../utils'

export const encodeCLPoolInitializeCalldata = (poolKey: PoolKey<'CL'>, sqrtPriceX96: bigint) => {
  return encodeFunctionData({
    abi: CLPoolManagerAbi,
    functionName: 'initialize',
    args: [encodePoolKey(poolKey), sqrtPriceX96],
  })
}
