import { encodeFunctionData, Hex } from 'viem'
import { CLPoolManagerAbi } from '../../../abis'
import { Bytes32, PoolKey } from '../../../types'
import { encodePoolKey } from '../../../utils'

export type CLPoolModifyLiquidityParams = {
  tickLower: number
  tickUpper: number
  liquidityDelta: bigint
  salt: Bytes32
}

export const encodeCLPoolModifyLiquidityCalldata = (
  poolKey: PoolKey<'CL'>,
  params: CLPoolModifyLiquidityParams,
  hookData: Hex = '0x'
) => {
  return encodeFunctionData({
    abi: CLPoolManagerAbi,
    functionName: 'modifyLiquidity',
    args: [encodePoolKey(poolKey), params, hookData],
  })
}
