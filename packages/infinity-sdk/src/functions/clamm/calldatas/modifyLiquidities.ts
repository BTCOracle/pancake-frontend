import { Hex, encodeFunctionData } from 'viem'
import { CLPositionManagerAbi } from '../../../abis'

export const encodeCLPositionModifyLiquidities = (calls: Hex, deadline: bigint) => {
  return encodeFunctionData({
    abi: CLPositionManagerAbi,
    functionName: 'modifyLiquidities',
    args: [calls, deadline],
  })
}
