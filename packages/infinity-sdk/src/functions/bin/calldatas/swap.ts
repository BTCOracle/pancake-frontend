import { Hex, encodeFunctionData } from 'viem'
import { BinPoolManagerAbi } from '../../../abis'
import { PoolKey } from '../../../types'
import { encodePoolKey } from '../../../utils/encodePoolKey'

export const binPoolSwapCalldata = (
  poolKey: PoolKey<'Bin'>,
  swapForY: boolean,
  amountIn: bigint,
  hookData: Hex = '0x'
) => {
  return encodeFunctionData({
    abi: BinPoolManagerAbi,
    functionName: 'swap',
    args: [encodePoolKey(poolKey), swapForY, amountIn, hookData],
  })
}
