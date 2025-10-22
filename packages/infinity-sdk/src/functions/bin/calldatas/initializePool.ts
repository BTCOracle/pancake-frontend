import { encodeFunctionData } from 'viem'
import { BinPositionManagerAbi } from '../../../abis'
import { PoolKey } from '../../../types'
import { encodePoolKey } from '../../../utils'

export const encodeBinPositionManagerInitializePoolCalldata = (poolKey: PoolKey<'Bin'>, activeId: bigint | number) => {
  return encodeFunctionData({
    abi: BinPositionManagerAbi,
    functionName: 'initializePool',
    args: [encodePoolKey(poolKey), Number(activeId)],
  })
}
