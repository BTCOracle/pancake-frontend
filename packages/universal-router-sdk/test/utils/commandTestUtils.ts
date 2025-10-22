import { ACTIONS, decodePoolKey, POOL_TYPE } from '@pancakeswap/infinity-sdk'
import { Currency } from '@pancakeswap/sdk'
import { Address } from 'viem'
import { expect } from 'vitest'
import { CommandType } from '../../src/router.types'
import { DecodedAction, DecodedCommand } from '../../src/utils/calldataDecode'
import { currencyAddressInfinity } from '../../src/utils/currencyAddressInfinity'

export function testWrapETHCommand(cmd: DecodedCommand, recipient: Address, amountMin: bigint) {
  expect(cmd.command).toEqual(CommandType[CommandType.WRAP_ETH])
  expect(cmd.args[0].name).toEqual('recipient')
  expect(cmd.args[0].value).toEqual(recipient)
  expect(cmd.args[1].name).toEqual('amountMin')
  expect(cmd.args[1].value).toEqual(amountMin)
}

export function testSweepCommand(cmd: DecodedCommand, token: Address, recipient: Address, amountMin: bigint) {
  expect(cmd.command).toEqual(CommandType[CommandType.SWEEP])
  expect(cmd.args[0].name).toEqual('token')
  expect(cmd.args[0].value).toEqual(token)
  expect(cmd.args[1].name).toEqual('recipient')
  expect(cmd.args[1].value).toEqual(recipient)
  expect(cmd.args[2].name).toEqual('amountMin')
  expect(cmd.args[2].value).toEqual(amountMin)
}

export function testV2SwapExactInCommand(
  cmd: DecodedCommand,
  recipient: Address,
  amountIn: bigint,
  amountOutMin: bigint,
  payerIsUser: boolean,
) {
  expect(cmd.command).toEqual(CommandType[CommandType.V2_SWAP_EXACT_IN])

  // Validate recipient
  expect(cmd.args[0].name).toEqual('recipient')
  expect(cmd.args[0].value).toEqual(recipient)

  // Validate amountIn
  expect(cmd.args[1].name).toEqual('amountIn')
  expect(cmd.args[1].value).toEqual(amountIn)

  // Validate amountOutMin
  expect(cmd.args[2].name).toEqual('amountOutMin')
  expect(cmd.args[2].value).toEqual(amountOutMin)

  // Validate payerIsUser
  expect(cmd.args[4].name).toEqual('payerIsUser')
  expect(cmd.args[4].value).toEqual(payerIsUser)
}

export function testInfinitySingleSwapAction(
  type: POOL_TYPE,
  action: DecodedAction,
  currency0: Currency,
  currency1: Currency,
  inputAmount: bigint,
  outputAmount: bigint,
  zeroForOne: boolean,
) {
  if (type === POOL_TYPE.CLAMM) {
    expect(action.action).toEqual(ACTIONS[ACTIONS.CL_SWAP_EXACT_IN_SINGLE])
  } else {
    expect(action.action).toEqual(ACTIONS[ACTIONS.BIN_SWAP_EXACT_IN_SINGLE])
  }
  expect(action.args[0].name).toEqual('params')
  const params = action.args[0].value as any
  const poolKey = decodePoolKey(params.poolKey, 'CL')
  expect(poolKey.currency0).toEqual(currencyAddressInfinity(currency0))
  expect(poolKey.currency1).toEqual(currencyAddressInfinity(currency1))
  expect(params.zeroForOne).toEqual(zeroForOne)
  expect(params.amountIn).toEqual(inputAmount)
  expect(params.amountOutMinimum).toEqual(outputAmount)
}

export function testInfinitySettleAllAction(action: DecodedAction, currency: Currency, amountIn: bigint) {
  expect(action.action).toEqual(ACTIONS[ACTIONS.SETTLE_ALL])
  expect(action.args[0].name).toEqual('currency')
  expect(action.args[0].value).toEqual(currencyAddressInfinity(currency))
  expect(action.args[1].name).toEqual('maxAmount')
  expect(action.args[1].value).toEqual(amountIn)
}

export function testInfinitySettleAction(
  action: DecodedAction,
  currency: Currency,
  amount: bigint,
  payerIsUser: boolean,
) {
  expect(action.action).toEqual(ACTIONS[ACTIONS.SETTLE])
  expect(action.args[0].name).toEqual('currency')
  expect(action.args[0].value).toEqual(currencyAddressInfinity(currency))
  expect(action.args[1].name).toEqual('amount')
  expect(action.args[1].value).toEqual(amount)
  expect(action.args[2].name).toEqual('payerIsUser')
  expect(action.args[2].value).toEqual(payerIsUser)
}

export function testInfinityTakeAllAction(action: DecodedAction, currency: Currency, minAmountOut: bigint) {
  expect(action.action).toEqual(ACTIONS[ACTIONS.TAKE_ALL])
  expect(action.args[0].name).toEqual('currency')
  expect(action.args[0].value).toEqual(currencyAddressInfinity(currency))
  expect(action.args[1].name).toEqual('minAmount')
  expect(action.args[1].value).toEqual(minAmountOut)
}

export function testInfinityTakeAction(action: DecodedAction, currency: Currency, recipient: Address, amount: bigint) {
  expect(action.action).toEqual(ACTIONS[ACTIONS.TAKE])
  expect(action.args[0].name).toEqual('currency')
  expect(action.args[0].value).toEqual(currencyAddressInfinity(currency))
  expect(action.args[1].name).toEqual('recipient')
  expect(action.args[1].value).toEqual(recipient)
  expect(action.args[2].name).toEqual('amount')
  expect(action.args[2].value).toEqual(amount)
}

export function testPerm2TransferFromCommand(
  command: DecodedCommand,
  token: Currency,
  recipient: Address,
  amount: bigint,
) {
  expect(command.command).toEqual(CommandType[CommandType.PERMIT2_TRANSFER_FROM])
  expect(command.args[0].name).toEqual('token')
  expect(command.args[0].value).toEqual(currencyAddressInfinity(token))
  expect(command.args[1].name).toEqual('recipient')
  expect(command.args[1].value).toEqual(recipient)
  expect(command.args[2].name).toEqual('amount')
  expect(command.args[2].value).toEqual(amount)
}

export function testUnwrapCommand(command: DecodedCommand, recipient: Address, amountMin: bigint) {
  expect(command.command).toEqual(CommandType[CommandType.UNWRAP_WETH])
  expect(command.args[0].name).toEqual('recipient')
  expect(command.args[0].value).toEqual(recipient)
  expect(command.args[1].name).toEqual('amountMin')
  expect(command.args[1].value).toEqual(amountMin)
}
