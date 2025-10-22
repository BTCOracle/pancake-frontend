import { BridgeOrder, OrderType } from '@pancakeswap/price-api-sdk'
import { Route, SmartRouter } from '@pancakeswap/smart-router'
import { Currency, CurrencyAmount, TradeType } from '@pancakeswap/swap-sdk-core'
import { Loadable } from '@pancakeswap/utils/Loadable'
import { convertTokenToCurrency, mapWithoutUrls } from 'hooks/Tokens'
import first from 'lodash/first'
import last from 'lodash/last'
import { BridgeTradeError } from 'quoter/quoter.types'
import { basisPointsToPercent } from 'utils/exchange'
import {
  EVMInterfaceOrder,
  isSVMOrder,
  isXOrder,
  type BridgeOrderWithCommands,
  type InterfaceOrder,
} from 'views/Swap/utils'
import { WHITELIST_TOKEN_MAP } from '../config'
import { type QuoteContext } from '../types'

type SwapOrderWithSlippage = InterfaceOrder & { trade: InterfaceOrder['trade'] & { routes: Route[] } }

export abstract class CrossChainQuoteStrategy {
  protected readonly context: QuoteContext

  constructor(protected readonly contextInstance: QuoteContext) {
    if (!contextInstance) {
      throw new Error('Context is required')
    }
    this.context = contextInstance
  }

  abstract executeQuote(): Loadable<InterfaceOrder>

  protected constructFinalQuote(
    commands: InterfaceOrder[],
    noSlippageCommands: InterfaceOrder[],
  ): BridgeOrderWithCommands {
    const commandsWithSlippage = commands.map((command) => {
      if (command.type === OrderType.PCS_BRIDGE) {
        return command
      }
      return this.constructSwapOrderRoutes(command)
    })

    const bridgeQuote = commandsWithSlippage.find((command) => command.type === OrderType.PCS_BRIDGE)

    if (!bridgeQuote) {
      throw new BridgeTradeError('No bridge quote found')
    }

    const noSlippageRoutes = noSlippageCommands
      ?.map((command) => (!isXOrder(command) ? command.trade.routes : []))
      .flat()

    return {
      bridgeTransactionData: bridgeQuote.bridgeTransactionData,
      type: OrderType.PCS_BRIDGE,
      bridgeFee: bridgeQuote.bridgeFee,
      expectedFillTimeSec: 'expectedFillTimeSec' in bridgeQuote ? bridgeQuote.expectedFillTimeSec : 0,
      trade: {
        // NOTE: safe cast to CurrencyAmount<Currency> since CrossChain won't support SVM yet
        inputAmount: first(commands)!.trade.inputAmount as CurrencyAmount<Currency>,
        // NOTE: Show output amount without slippage.
        // Minimum output received (with slippage) is different from ouputAmount
        outputAmount: last(noSlippageCommands)!.trade.outputAmount as CurrencyAmount<Currency>,
        tradeType: TradeType.EXACT_INPUT,
        routes: noSlippageRoutes,
      },
      noSlippageCommands: noSlippageCommands as EVMInterfaceOrder[],
      commands: commandsWithSlippage as EVMInterfaceOrder[],
    }
  }

  static validateQuoteResult(loadable: Loadable<BridgeOrder | InterfaceOrder>, errorMessage: string) {
    const result = loadable.unwrapOr(undefined)

    if (!result || isSVMOrder(result) || !result.trade.outputAmount.greaterThan(0)) {
      throw new BridgeTradeError(errorMessage)
    }

    return result
  }

  protected constructSwapOrderRoutes(swapOrder: InterfaceOrder): InterfaceOrder {
    if (isSVMOrder(swapOrder)) {
      throw new Error('SVM order not supported for cross chain')
    }

    if (!('routes' in swapOrder.trade)) {
      return swapOrder as SwapOrderWithSlippage
    }

    const swapOrderRoutes = swapOrder.trade.routes || []
    const userSlippagePct = basisPointsToPercent(this.context.userSlippage)

    const routes = swapOrderRoutes.map((route) => {
      return {
        ...route,
        outputAmount: SmartRouter.minimumAmountOut(swapOrder.trade, userSlippagePct, route.outputAmount),
      }
    })

    return {
      ...swapOrder,
      trade: {
        ...swapOrder.trade,
        outputAmount: SmartRouter.minimumAmountOut(swapOrder.trade, userSlippagePct, swapOrder.trade.outputAmount),
        routes,
      },
    } as SwapOrderWithSlippage
  }

  protected getBridgeDestinationCurrency(tokenAddress?: string): Currency {
    const originTokenAddress = tokenAddress ?? this.context.baseCurrencyAmount.currency.wrapped.address

    // Find bridge route where the input token is the origin token
    const bridgeRoute = this.context.routes.find((route) => route.originToken === originTokenAddress)

    if (!bridgeRoute) {
      throw new Error('Destination bridge route not found')
    }

    // Get token map for destination chain
    const destinationTokenMap = mapWithoutUrls(this.context.tokenMap, bridgeRoute.destinationChainId)

    // Get the destination token info
    const destinationTokenInfo = destinationTokenMap[bridgeRoute.destinationToken]

    if (!destinationTokenInfo) {
      throw new Error('Destination token not supported for bridge')
    }

    return convertTokenToCurrency(destinationTokenInfo)
  }

  protected getBridgeOriginCurrency(): Currency {
    const outputToken = this.context.quoteCurrency

    // Find bridge route where the output token is the destination token
    const bridgeRoute = this.context.routes.find((route) => route.destinationToken === outputToken.wrapped.address)

    if (!bridgeRoute) {
      throw new Error('Origin bridge route not found')
    }

    // Get token map for origin chain
    const originTokenMap = mapWithoutUrls(this.context.tokenMap, bridgeRoute.originChainId)

    // Get the origin token info
    const originTokenInfo = originTokenMap[bridgeRoute.originToken]

    if (!originTokenInfo) {
      throw new Error('Origin Token not supported for bridge')
    }

    return convertTokenToCurrency(originTokenInfo)
  }

  protected getWhitelistedOriginBridgeCurrencies(): Currency[] {
    const { chainId } = this.context.baseCurrencyAmount.currency

    const tokenMapWithoutUrls = mapWithoutUrls(this.context.tokenMap, chainId)
    const whitelistTokens = WHITELIST_TOKEN_MAP[chainId] || []

    return this.context.routes
      .filter((route) => route.originChainId === chainId && whitelistTokens.includes(route.originToken))
      .reduce((uniqueTokens, route) => {
        const tokenInfo = tokenMapWithoutUrls[route.originToken]
        if (!tokenInfo) return uniqueTokens

        const token = convertTokenToCurrency(tokenInfo)
        if (!token || uniqueTokens.some((t) => t.wrapped.address === token.wrapped.address)) {
          return uniqueTokens
        }

        uniqueTokens.push(token)
        return uniqueTokens
      }, [] as Currency[])
  }
}
