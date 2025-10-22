import { InfinityTradeWithoutGraph } from '@pancakeswap/smart-router/dist/evm/infinity-router'
import { TradeType } from '@pancakeswap/swap-sdk-core'
import { Loadable } from '@pancakeswap/utils/Loadable'
import tryParseCurrencyAmount from 'utils/tryParseCurrencyAmount'
import { generateSwapCommands } from 'views/Swap/Bridge/api'
import { type InterfaceOrder } from 'views/Swap/utils'
import { CrossChainQuoteStrategy } from '../base/CrossChainQuoteStrategy'

export class BridgeToSwapStrategy extends CrossChainQuoteStrategy {
  executeQuote(): Loadable<InterfaceOrder> {
    // 1. Get bridge destination currency
    const bridgeDestinationCurrency = this.getBridgeDestinationCurrency()

    const swapOrderLoadable = this.context.atomGetters.getSwapQuote({
      baseCurrency: bridgeDestinationCurrency,
      amount: tryParseCurrencyAmount(this.context.baseCurrencyAmount.toExact(), bridgeDestinationCurrency),
    })

    if (swapOrderLoadable.isPending()) {
      return Loadable.Pending<InterfaceOrder>()
    }

    if (swapOrderLoadable.isFail()) {
      return Loadable.Fail<InterfaceOrder>(swapOrderLoadable.error)
    }

    const swapOrder = CrossChainQuoteStrategy.validateQuoteResult(swapOrderLoadable, 'No swap order')

    const swapOrderWithSlippage = this.constructSwapOrderRoutes(swapOrder)

    const swapCommand = generateSwapCommands({
      trade: swapOrderWithSlippage.trade as InfinityTradeWithoutGraph<TradeType>,
      allowedSlippage: this.context.userSlippage,
    })

    const finalBridgeQuoteLoadable = this.context.atomGetters.getBridgeQuote({
      inputAmount: this.context.baseCurrencyAmount,
      outputCurrency: bridgeDestinationCurrency,
      commands: [swapCommand],
    })

    if (finalBridgeQuoteLoadable.isPending()) {
      return Loadable.Pending<InterfaceOrder>()
    }

    if (finalBridgeQuoteLoadable.isFail()) {
      return Loadable.Fail<InterfaceOrder>(finalBridgeQuoteLoadable.error)
    }

    const finalBridgeQuote = CrossChainQuoteStrategy.validateQuoteResult(
      finalBridgeQuoteLoadable,
      'No final bridge quote found',
    )

    const finalSwapOrderLoadable = this.context.atomGetters.getSwapQuote({
      baseCurrency: finalBridgeQuote.trade.outputAmount.currency,
      amount: finalBridgeQuote.trade.outputAmount,
    })

    if (finalSwapOrderLoadable.isPending()) {
      return Loadable.Pending<InterfaceOrder>()
    }

    if (finalSwapOrderLoadable.isFail()) {
      return Loadable.Fail<InterfaceOrder>(finalSwapOrderLoadable.error)
    }

    const finalSwapOrder = CrossChainQuoteStrategy.validateQuoteResult(finalSwapOrderLoadable, 'No final swap order')

    const finalQuote = this.constructFinalQuote([finalBridgeQuote, finalSwapOrder], [finalBridgeQuote, finalSwapOrder])

    return Loadable.Just(finalQuote)
  }
}
