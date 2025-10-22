import { Loadable } from '@pancakeswap/utils/Loadable'
import { Field } from 'state/swap/actions'
import { computeSlippageAdjustedAmounts } from 'views/Swap/V3Swap/utils/exchange'
import { type InterfaceOrder } from 'views/Swap/utils'
import { Currency, CurrencyAmount } from '@pancakeswap/swap-sdk-core'
import { CrossChainQuoteStrategy } from '../base/CrossChainQuoteStrategy'

export class SwapToBridgeStrategy extends CrossChainQuoteStrategy {
  executeQuote(): Loadable<InterfaceOrder> {
    // Create the origin currency for the bridge
    const bridgeOriginCurrency = this.getBridgeOriginCurrency()

    // Get the swap quote from base currency to bridge origin currency
    const swapOrderLoadable = this.context.atomGetters.getSwapQuote({
      currency: bridgeOriginCurrency,
    })

    if (swapOrderLoadable.isPending()) {
      return Loadable.Pending<InterfaceOrder>()
    }

    if (swapOrderLoadable.isFail()) {
      return Loadable.Fail<InterfaceOrder>(swapOrderLoadable.error)
    }

    const swapOrder = CrossChainQuoteStrategy.validateQuoteResult(swapOrderLoadable, 'No swap order')

    const bridgeQuoteNoSlippageLoadable = this.context.atomGetters.getBridgeQuote({
      inputAmount: swapOrder.trade.outputAmount,
      outputCurrency: this.context.quoteCurrency,
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

    const slippagedOutputAmount =
      computeSlippageAdjustedAmounts(swapOrder, this.context.userSlippage)[Field.OUTPUT] || swapOrder.trade.outputAmount

    // Use the swap output amount as the bridge input amount
    const bridgeQuoteLoadable = this.context.atomGetters.getBridgeQuote({
      inputAmount: slippagedOutputAmount as CurrencyAmount<Currency>,
      outputCurrency: this.context.quoteCurrency,
    })

    if (bridgeQuoteLoadable.isPending()) {
      return Loadable.Pending<InterfaceOrder>()
    }

    if (bridgeQuoteLoadable.isFail()) {
      return Loadable.Fail<InterfaceOrder>(bridgeQuoteLoadable.error)
    }

    const bridgeQuote = CrossChainQuoteStrategy.validateQuoteResult(bridgeQuoteLoadable, 'No bridge quote')

    const finalQuote = this.constructFinalQuote([swapOrder, bridgeQuote], [swapOrder, bridgeQuoteNoSlippage])

    return Loadable.Just(finalQuote)
  }
}
