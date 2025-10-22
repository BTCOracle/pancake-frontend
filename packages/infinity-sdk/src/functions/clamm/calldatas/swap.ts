import { encodeFunctionData, Hex } from 'viem'
import { CLPoolManagerAbi } from '../../../abis/CLPoolManagerAbi'
import { PoolKey } from '../../../types'
import { encodePoolKey } from '../../../utils'

export type CLPoolSwapParams = {
  zeroForOne: boolean
  amountSpecified: bigint
  sqrtPriceLimitX96: bigint
}

export const encodeCLPoolSwapCalldata = (
  poolKey: PoolKey<'CL'>,
  swapParams: CLPoolSwapParams,
  hookData: Hex = '0x'
) => {
  return encodeFunctionData({
    abi: CLPoolManagerAbi,
    functionName: 'swap',
    args: [encodePoolKey(poolKey), swapParams, hookData],
  })
}
