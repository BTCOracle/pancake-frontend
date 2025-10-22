import { encodeFunctionData, Hex } from 'viem'
import { CLPoolManagerAbi } from '../../../abis'
import { PoolKey } from '../../../types'
import { encodePoolKey } from '../../../utils'

export const encodeCLPoolDonateCalldata = (
  poolKey: PoolKey<'CL'>,
  amount0: bigint,
  amount1: bigint,
  hookData: Hex = '0x'
) => {
  return encodeFunctionData({
    abi: CLPoolManagerAbi,
    functionName: 'donate',
    args: [encodePoolKey(poolKey), amount0, amount1, hookData],
  })
}
