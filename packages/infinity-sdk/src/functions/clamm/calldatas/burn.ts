import { encodeFunctionData, Hex } from 'viem'
import { CLPositionManagerAbi } from '../../../abis'
import { ACTIONS } from '../../../constants/actions'
import { CLPositionConfig, EncodedCLPositionConfig } from '../../../types'
import { encodeCLPoolParameters } from '../../../utils'
import { ActionsPlanner } from '../../../utils/ActionsPlanner'

export const encodeCLPositionManagerBurnCalldata = (
  tokenId: bigint,
  positionConfig: CLPositionConfig,
  amount0Min: bigint,
  amount1Min: bigint,
  hookData: Hex = '0x',
  deadline: bigint
) => {
  const planner = new ActionsPlanner()
  const encodedPositionConfig: EncodedCLPositionConfig = {
    poolKey: {
      ...positionConfig.poolKey,
      parameters: encodeCLPoolParameters(positionConfig.poolKey.parameters),
    },
    tickLower: positionConfig.tickLower,
    tickUpper: positionConfig.tickUpper,
  }

  planner.add(ACTIONS.CL_BURN_POSITION, [tokenId, encodedPositionConfig, amount0Min, amount1Min, hookData])
  const calls = planner.finalizeModifyLiquidityWithClose(positionConfig.poolKey)

  return encodeFunctionData({
    abi: CLPositionManagerAbi,
    functionName: 'modifyLiquidities',
    args: [calls, deadline],
  })
}
