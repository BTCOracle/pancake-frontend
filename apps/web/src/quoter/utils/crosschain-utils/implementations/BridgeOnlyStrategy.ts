import { Loadable } from '@pancakeswap/utils/Loadable'
import { type InterfaceOrder } from 'views/Swap/utils'
import { CrossChainQuoteStrategy } from '../base/CrossChainQuoteStrategy'

export class BridgeOnlyStrategy extends CrossChainQuoteStrategy {
  executeQuote(): Loadable<InterfaceOrder> {
    // Native tokens use wrapped addresses for route checks but 0x000..00 for actual submission
    // If user selects ETH -> WETH or WETH -> ETH
    const bridgeQuoteLoadable = this.context.atomGetters.getBridgeQuote({
      inputAmount: this.context.baseCurrencyAmount,
      outputCurrency: this.context.quoteCurrency,
    })

    if (bridgeQuoteLoadable.isPending()) {
      return Loadable.Pending<InterfaceOrder>()
    }

    if (bridgeQuoteLoadable.isFail()) {
      return Loadable.Fail<InterfaceOrder>(bridgeQuoteLoadable.error)
    }

    const bridgeQuote = CrossChainQuoteStrategy.validateQuoteResult(bridgeQuoteLoadable, 'No bridge quote')

    const finalQuote = this.constructFinalQuote([bridgeQuote], [bridgeQuote])

    return Loadable.Just(finalQuote)
  }
}
