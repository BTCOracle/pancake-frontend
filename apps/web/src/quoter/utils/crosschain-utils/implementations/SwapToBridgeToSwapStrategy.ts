import { SmartRouter } from '@pancakeswap/smart-router'
import { InfinityTradeWithoutGraph } from '@pancakeswap/smart-router/dist/evm/infinity-router'
import { TradeType } from '@pancakeswap/swap-sdk-core'
import { Loadable } from '@pancakeswap/utils/Loadable'
import { BridgeTradeError, NoValidRouteError } from 'quoter/quoter.types'
import { basisPointsToPercent } from 'utils/exchange'
import tryParseCurrencyAmount from 'utils/tryParseCurrencyAmount'
import { generateSwapCommands } from 'views/Swap/Bridge/api'
import { isSVMOrder, type InterfaceOrder } from 'views/Swap/utils'
import { CrossChainQuoteStrategy } from '../base/CrossChainQuoteStrategy'
import { type DestinationSwapQuoteSchema } from '../types'

export class SwapToBridgeToSwapStrategy extends CrossChainQuoteStrategy {
  executeQuote(): Loadable<InterfaceOrder> {
    // 1. Find origin swap quotes + destination token amounts
    const originSwapOrders = this.getOriginSwapOrders()

    if (originSwapOrders.some((path) => path.isPending())) {
      return Loadable.Pending<InterfaceOrder>()
    }

    const validOriginSwapOrders = originSwapOrders
      .filter((path) => !path.isNothing() && !path.isFail())
      .map((quote) => quote.unwrapOr(undefined))
      .filter((quote): quote is InterfaceOrder => quote !== undefined)

    if (validOriginSwapOrders.length === 0) {
      return Loadable.Fail<InterfaceOrder>(new NoValidRouteError('No valid origin swap quotes'))
    }

    // 2. Find destination swap quotes from valid origin swap quotes
    const destinationSwapQuotes = this.getDestinationSwapQuotes(validOriginSwapOrders)

    // Check if any paths are pending
    if (destinationSwapQuotes.some((path) => path.isPending())) {
      return Loadable.Pending<InterfaceOrder>()
    }

    // Filter out Nothing results and unwrap Just values
    const validDestinationSwapQuotes = destinationSwapQuotes
      .filter((path) => !path.isNothing() && !path.isFail())
      .map((path) => path.unwrapOr(undefined))
      .filter((quote): quote is DestinationSwapQuoteSchema => quote !== undefined)

    if (validDestinationSwapQuotes.length === 0) {
      return Loadable.Fail<InterfaceOrder>(new BridgeTradeError('No valid destination swap quotes'))
    }

    // 3. Pick the best quote based on output amount
    const bestPath = SwapToBridgeToSwapStrategy.selectBestPath(validDestinationSwapQuotes)

    const { originSwapOrder, destinationSwapOrder } = bestPath

    const destinationSwapOrderWithSlippage = this.constructSwapOrderRoutes(destinationSwapOrder)

    const destinationSwapCommand = generateSwapCommands({
      trade: destinationSwapOrderWithSlippage.trade as InfinityTradeWithoutGraph<TradeType>,
      allowedSlippage: this.context.userSlippage,
    })

    if (isSVMOrder(originSwapOrder) || isSVMOrder(destinationSwapOrder)) {
      throw new Error('SVM order not supported for cross chain')
    }

    const slippagedOriginSwapOrderOutputAmount = SmartRouter.minimumAmountOut(
      originSwapOrder.trade,
      basisPointsToPercent(this.context.userSlippage),
    )

    // 4.1 Refetch bridge quote without slippage
    const bridgeQuoteNoSlippageLoadable = this.context.atomGetters.getBridgeQuote({
      inputAmount: originSwapOrder.trade.outputAmount,
      outputCurrency: destinationSwapOrder.trade.inputAmount.currency,
      commands: [destinationSwapCommand],
    })

    if (bridgeQuoteNoSlippageLoadable.isPending()) {
      return Loadable.Pending<InterfaceOrder>()
    }

    if (bridgeQuoteNoSlippageLoadable.isFail()) {
      return Loadable.Fail<InterfaceOrder>(bridgeQuoteNoSlippageLoadable.error)
    }

    const bridgeQuoteNoSlippage = CrossChainQuoteStrategy.validateQuoteResult(
      bridgeQuoteNoSlippageLoadable,
      'No bridge quote',
    )

    // 4.2 Refetch bridge quote with postbridge calldata fee
    const bridgeQuoteWithPostbridgeCalldataFee = this.context.atomGetters.getBridgeQuote({
      inputAmount: slippagedOriginSwapOrderOutputAmount,
      outputCurrency: destinationSwapOrder.trade.inputAmount.currency,
      commands: [destinationSwapCommand],
    })

    if (bridgeQuoteWithPostbridgeCalldataFee.isPending()) {
      return Loadable.Pending<InterfaceOrder>()
    }

    const finalBridgeQuote = CrossChainQuoteStrategy.validateQuoteResult(
      bridgeQuoteWithPostbridgeCalldataFee,
      'No final bridge quote found',
    )

    // 5.1 Refetch swap quote without slippage

    const finalDestinationSwapOrderNoSlippageLoadable = this.context.atomGetters.getSwapQuote({
      baseCurrency: bridgeQuoteNoSlippage.trade.outputAmount.currency,
      amount: bridgeQuoteNoSlippage.trade.outputAmount,
    })

    if (finalDestinationSwapOrderNoSlippageLoadable.isPending()) {
      return Loadable.Pending<InterfaceOrder>()
    }

    const finalDestinationSwapOrderNoSlippage = CrossChainQuoteStrategy.validateQuoteResult(
      finalDestinationSwapOrderNoSlippageLoadable,
      'No final swap order',
    )

    // 5.2 Refetch swap quote with postbridge calldata fee
    const finalDestinationSwapOrderLoadable = this.context.atomGetters.getSwapQuote({
      baseCurrency: finalBridgeQuote.trade.outputAmount.currency,
      amount: finalBridgeQuote.trade.outputAmount,
    })

    if (finalDestinationSwapOrderLoadable.isPending()) {
      return Loadable.Pending<InterfaceOrder>()
    }

    const finalDestinationSwapOrder = CrossChainQuoteStrategy.validateQuoteResult(
      finalDestinationSwapOrderLoadable,
      'No final swap order',
    )

    const finalQuote = this.constructFinalQuote(
      [originSwapOrder, finalBridgeQuote, finalDestinationSwapOrder],
      [originSwapOrder, bridgeQuoteNoSlippage, finalDestinationSwapOrderNoSlippage],
    )

    return Loadable.Just(finalQuote)
  }

  private getOriginSwapOrders(): Loadable<InterfaceOrder>[] {
    return this.getWhitelistedOriginBridgeCurrencies().map((originBridgeCurrency) => {
      const swapOrderLoadable = this.context.atomGetters.getSwapQuote({
        currency: originBridgeCurrency,
      })

      if (swapOrderLoadable.isPending()) {
        return Loadable.Pending<InterfaceOrder>()
      }

      if (swapOrderLoadable.isFail()) {
        return Loadable.Fail<InterfaceOrder>(swapOrderLoadable.error)
      }

      try {
        const originSwapOrder = CrossChainQuoteStrategy.validateQuoteResult(swapOrderLoadable, 'No swap order')

        return Loadable.Just<InterfaceOrder>(originSwapOrder)
      } catch (error) {
        return Loadable.Fail<InterfaceOrder>(error)
      }
    })
  }

  private getDestinationSwapQuotes(validOriginSwapOrders: InterfaceOrder[]): Loadable<DestinationSwapQuoteSchema>[] {
    return validOriginSwapOrders.map((originSwapOrder) => {
      const destinationBridgeCurrency = this.getBridgeDestinationCurrency(
        originSwapOrder.trade.outputAmount.currency.wrapped.address,
      )

      // Get the swap quote from bridge destination to quote currency
      const destinationSwapOrderLoadable = this.context.atomGetters.getSwapQuote({
        baseCurrency: destinationBridgeCurrency,
        amount: tryParseCurrencyAmount(originSwapOrder.trade.outputAmount.toExact(), destinationBridgeCurrency),
      })

      if (destinationSwapOrderLoadable.isPending()) {
        return Loadable.Pending()
      }

      if (destinationSwapOrderLoadable.isFail()) {
        return Loadable.Fail(destinationSwapOrderLoadable.error)
      }

      try {
        const destinationSwapOrder = CrossChainQuoteStrategy.validateQuoteResult(
          destinationSwapOrderLoadable,
          'No final swap order',
        )
        return Loadable.Just<DestinationSwapQuoteSchema>({
          destinationSwapOrder,
          originSwapOrder,
        })
      } catch (error) {
        return Loadable.Fail<DestinationSwapQuoteSchema>(error)
      }
    })
  }

  static selectBestPath(validDestinationSwapQuotes: DestinationSwapQuoteSchema[]): DestinationSwapQuoteSchema {
    let bestPath = validDestinationSwapQuotes[0]

    for (let i = 1; i < validDestinationSwapQuotes.length; i++) {
      const currentPath = validDestinationSwapQuotes[i]

      // Compare output amounts to find the best path
      if (
        currentPath.destinationSwapOrder.trade.outputAmount.greaterThan(
          bestPath.destinationSwapOrder.trade.outputAmount,
        )
      ) {
        bestPath = currentPath
      }
    }

    return bestPath
  }
}
