import invariant from 'tiny-invariant'
import { Address, Hex, isAddress, isAddressEqual, zeroAddress } from 'viem'
import { ACTIONS } from '../../../constants/actions'
import { PoolKey } from '../../../types'
import { encodeBinPoolParameters } from '../../../utils'
import { ActionsPlanner } from '../../../utils/ActionsPlanner'
import { encodeBinPositionModifyLiquidities } from './modifyLiquidities'

export type RemoveBinLiquidityParam = {
  poolKey: PoolKey<'Bin'>
  amount0Min: bigint
  amount1Min: bigint
  ids: number[]
  amounts: bigint[]
  from: Address
  hookData?: Hex
  wrapAddress?: Address
  recipient?: Address
}

export const encodeBinPositionManagerRemoveLiquidityCalldata = (params: RemoveBinLiquidityParam, deadline: bigint) => {
  const planner = new ActionsPlanner()
  const { wrapAddress, recipient, ...p } = params
  const decodedParams = {
    ...p,
    hookData: params.hookData ?? '0x',
    poolKey: {
      ...params.poolKey,
      parameters: encodeBinPoolParameters(params.poolKey.parameters),
    },
  }
  planner.add(ACTIONS.BIN_REMOVE_LIQUIDITY, [decodedParams])
  let calls: Hex
  if (wrapAddress && !isAddressEqual(wrapAddress, zeroAddress)) {
    invariant(recipient && isAddress(recipient), 'Invalid Wrap Config')
    calls = planner.finalizeModifyLiquidityWithCloseWrap(params.poolKey, wrapAddress, recipient)
  } else {
    calls = planner.finalizeModifyLiquidityWithClose(params.poolKey)
  }
  return encodeBinPositionModifyLiquidities(calls, deadline)
}
