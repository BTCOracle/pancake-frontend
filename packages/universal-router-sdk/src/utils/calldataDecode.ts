import { ACTIONS, ACTIONS_ABI, InfinityUsedAction } from '@pancakeswap/infinity-sdk'
import { decodeAbiParameters, decodeFunctionData, Hex, ParseAbiParameters, toBytes } from 'viem'
import { UniversalRouterABI } from '../abis/UniversalRouter'
import { CommandType } from '../router.types'
import { ABI_PARAMETER } from './createCommand'

export type DecodedArg = {
  type: string
  name: string
  value: unknown
}

export type DecodedAction = {
  action: string
  args: DecodedArg[]
}
export type DecodedCommand = {
  command: string
  args: DecodedArg[]
  actions?: DecodedAction[]
}

export function decodeUniversalCalldata(
  calldata: Hex,
  abiParameter: Record<string, ParseAbiParameters<string>> = ABI_PARAMETER,
): DecodedCommand[] {
  const { functionName, args } = decodeFunctionData({
    abi: UniversalRouterABI,
    data: calldata,
  })
  if (functionName !== 'execute') throw RangeError(`Invalid function called: ${functionName}, support 'execute' only`)

  const commands =
    args[0]
      .toString()
      .match(/../g)
      ?.splice(1)
      .map((str) => BigInt(`0x${str}`).toString()) ?? []

  const decoded: DecodedCommand[] = []

  for (const [index, command] of Object.entries(commands)) {
    const abi: ParseAbiParameters<string> = abiParameter[command]

    const commandName: string = CommandType[parseInt(command)]

    const parameters = decodeAbiParameters(abi, args[1][Number(index)])

    const formatedArgs: DecodedCommand['args'] = []

    for (const [i, p] of Object.entries(abi)) {
      formatedArgs.push({
        type: p.type,
        name: p.name!,
        value: parameters[Number(i)],
      })
    }
    if (commandName === 'INFI_SWAP') {
      const decodedActions = decodeActions(formatedArgs[0].value as Hex, formatedArgs[1].value as Hex[])
      decoded.push({
        command: commandName,
        args: [],
        actions: decodedActions,
      })
    } else {
      decoded.push({
        command: commandName,
        args: formatedArgs,
      })
    }
  }

  return decoded
}

function decodeActions(actionsHex: Hex, inputs: Hex[]) {
  const actions = Array.from(toBytes(actionsHex))
  const decodedActions: DecodedAction[] = []
  for (const [actionIndex, actionCode] of Object.entries(actions)) {
    const actionType = actionCode as InfinityUsedAction
    const actionName = ACTIONS[actionType]
    const abi = ACTIONS_ABI[actionType]
    const parameters = decodeAbiParameters(abi, inputs[Number(actionIndex)])
    const formatedArgs: DecodedArg[] = []
    for (const [i, p] of Object.entries(abi)) {
      formatedArgs.push({
        type: p.type,
        name: p.name!,
        value: parameters[Number(i)],
      })
    }
    decodedActions.push({
      action: actionName,
      args: formatedArgs,
    })
  }
  return decodedActions
}
