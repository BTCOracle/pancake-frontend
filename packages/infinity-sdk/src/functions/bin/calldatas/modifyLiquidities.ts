import { Hex, encodeFunctionData } from 'viem'
import { BinPositionManagerAbi } from '../../../abis'

export const encodeBinPositionModifyLiquidities = (calls: Hex, deadline: bigint) => {
  return encodeFunctionData({
    abi: BinPositionManagerAbi,
    functionName: 'modifyLiquidities',
    args: [calls, deadline],
  })
}
