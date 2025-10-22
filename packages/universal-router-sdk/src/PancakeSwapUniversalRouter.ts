import { TradeType } from '@pancakeswap/sdk'
import { SmartRouter, SmartRouterTrade } from '@pancakeswap/smart-router'
import { MethodParameters } from '@pancakeswap/v3-sdk'
import invariant from 'tiny-invariant'
import { encodeFunctionData, Hex, toHex } from 'viem'
import { UniversalRouterABI } from './abis/UniversalRouter'
import { TradePlanner } from './entities/protocols/TradePlanner'
import { PancakeSwapOptions, SwapRouterConfig } from './entities/types'
import { RoutePlanner } from './utils/RoutePlanner'
import { decodeUniversalCalldata } from './utils/calldataDecode'
import { encodePermit } from './utils/encodePermit'

export abstract class PancakeSwapUniversalRouter {
  /**
   * Produces the on-chain method name to call and the hex encoded parameters to pass as arguments for a given trade.
   * @param trades to produce call parameters for
   * @param options options for the call parameters
   */
  public static swapERC20CallParameters(
    trade: Omit<SmartRouterTrade<TradeType>, 'gasEstimate'>,
    _options: PancakeSwapOptions,
  ): MethodParameters {
    const options = { payerIsUser: true, ..._options }
    const planner = new TradePlanner(trade, options)

    const inputCurrency = planner.trade.inputAmount.currency
    if (options.payerIsUser) {
      invariant(!(inputCurrency.isNative && !!options.inputTokenPermit), 'NATIVE_INPUT_PERMIT')
    }

    if (options.inputTokenPermit && typeof options.inputTokenPermit === 'object') {
      encodePermit(planner, options.inputTokenPermit)
    }

    const nativeCurrencyValue = options.payerIsUser
      ? inputCurrency.isNative
        ? SmartRouter.maximumAmountIn(planner.trade, options.slippageTolerance, planner.trade.inputAmount).quotient
        : 0n
      : 0n
    planner.encode()
    const encoded = PancakeSwapUniversalRouter.encodePlan(planner, nativeCurrencyValue, {
      deadline: options.deadlineOrPreviousBlockhash
        ? BigInt(options.deadlineOrPreviousBlockhash.toString())
        : undefined,
    })
    return encoded
  }

  public static decodeCallData(calldata: Hex) {
    return decodeUniversalCalldata(calldata)
  }

  /**
   * Encodes a planned route into a method name and parameters for the Router contract.
   * @param planner the planned route
   * @param nativeCurrencyValue the native currency value of the planned route
   * @param config the router config
   */
  private static encodePlan(
    planner: RoutePlanner,
    nativeCurrencyValue: bigint,
    config: SwapRouterConfig = {},
  ): MethodParameters {
    const { commands, inputs } = planner
    const calldata = config.deadline
      ? encodeFunctionData({
          abi: UniversalRouterABI,
          args: [commands, inputs, BigInt(config.deadline)],
          functionName: 'execute',
        })
      : encodeFunctionData({ abi: UniversalRouterABI, args: [commands, inputs], functionName: 'execute' })
    return { calldata, value: toHex(nativeCurrencyValue) }
  }
}
