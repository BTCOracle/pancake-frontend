import { Address, Hex, zeroAddress } from 'viem'
import { ACTIONS } from '../../../constants/actions'
import { PoolKey } from '../../../types'
import { encodeBinPoolParameters } from '../../../utils'
import { ActionsPlanner } from '../../../utils/ActionsPlanner'
import { encodeBinPositionModifyLiquidities } from './modifyLiquidities'

export type BinAddLiquidityParams = {
  poolKey: PoolKey<'Bin'>
  amount0: bigint
  amount1: bigint
  amount0Max: bigint
  amount1Max: bigint
  activeIdDesired: bigint
  idSlippage: bigint
  deltaIds: number[]
  to: Address
  distributionX: bigint[]
  distributionY: bigint[]
  hookData?: Hex
}
export const encodeBinPositionManagerAddLiquidityCalldata = (params: BinAddLiquidityParams, deadline: bigint) => {
  const planner = new ActionsPlanner()
  const decodedParams = {
    ...params,
    poolKey: {
      ...params.poolKey,
      parameters: encodeBinPoolParameters(params.poolKey.parameters),
    },
  }
  const containNativeCurrency = params.poolKey.currency0 === zeroAddress

  planner.add(ACTIONS.BIN_ADD_LIQUIDITY, [decodedParams])
  const calls = containNativeCurrency
    ? planner.finalizeModifyLiquidityWithCloseNative(params.poolKey, params.to)
    : planner.finalizeModifyLiquidityWithClose(params.poolKey)
  return encodeBinPositionModifyLiquidities(calls, deadline)
}
