import { Address, encodeFunctionData, Hex, zeroAddress } from 'viem'
import { CLPositionManagerAbi } from '../../../abis'
import { ACTIONS } from '../../../constants/actions'
import { CLPositionConfig, EncodedCLPositionConfig } from '../../../types'
import { encodeCLPoolParameters } from '../../../utils'
import { ActionsPlanner } from '../../../utils/ActionsPlanner'

export const encodeCLPositionManagerMintCalldata = (
  positionConfig: CLPositionConfig,
  liquidity: bigint,
  recipient: Address,
  amount0Max: bigint,
  amount1Max: bigint,
  deadline: bigint,
  hookData: Hex = '0x'
) => {
  const planner = new ActionsPlanner()
  if (!positionConfig.poolKey.hooks) {
    // eslint-disable-next-line no-param-reassign
    positionConfig.poolKey.hooks = zeroAddress as `0x${string}`
  }

  const encodedPositionConfig: EncodedCLPositionConfig = {
    ...positionConfig,
    poolKey: {
      ...positionConfig.poolKey,
      parameters: encodeCLPoolParameters(positionConfig.poolKey.parameters),
    },
  }

  planner.add(ACTIONS.CL_MINT_POSITION, [encodedPositionConfig, liquidity, amount0Max, amount1Max, recipient, hookData])
  const calls = planner.finalizeModifyLiquidityWithSettlePair(positionConfig.poolKey, recipient)

  return encodeFunctionData({
    abi: CLPositionManagerAbi,
    functionName: 'modifyLiquidities',
    args: [calls, deadline],
  })
}
