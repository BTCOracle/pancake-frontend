import { type Currency } from '@pancakeswap/swap-sdk-core'
import { BridgeTradeError } from 'quoter/quoter.types'
import { type Route } from 'views/Swap/Bridge/api'
import { isSolana } from '@pancakeswap/chains'
import { CrossChainQuoteStrategy } from './base/CrossChainQuoteStrategy'
import { BridgeOnlyStrategy } from './implementations/BridgeOnlyStrategy'
import { BridgeToSwapStrategy } from './implementations/BridgeToSwapStrategy'
import { SwapToBridgeStrategy } from './implementations/SwapToBridgeStrategy'
import { SwapToBridgeToSwapStrategy } from './implementations/SwapToBridgeToSwapStrategy'
import { PatternType, QuoteContext } from './types'
import { BridgeTokenResolver } from './utils/BridgeTokenResolver'
import { BridgeSolanaEvmStrategy } from './implementations/BridgeSolanaEvmStrategy'

const STRATEGIES = {
  [PatternType.BRIDGE_ONLY]: BridgeOnlyStrategy,
  [PatternType.BRIDGE_TO_SWAP]: BridgeToSwapStrategy,
  [PatternType.SWAP_TO_BRIDGE]: SwapToBridgeStrategy,
  [PatternType.SWAP_TO_BRIDGE_TO_SWAP]: SwapToBridgeToSwapStrategy,
  [PatternType.BRIDGE_SOLANA_EVM]: BridgeSolanaEvmStrategy,
} as const

export class CrossChainPatternClassifier {
  static determinePattern(routes: Route[], baseCurrency: Currency, quoteCurrency: Currency): PatternType {
    // Skip check if baseCurrency or quoteCurrency is solana
    const skipCheckRoutes = isSolana(baseCurrency.chainId) || isSolana(quoteCurrency.chainId)

    if (!skipCheckRoutes && routes.length === 0) {
      throw new BridgeTradeError('No available routes')
    }

    return BridgeTokenResolver.determinePattern(routes, baseCurrency, quoteCurrency)
  }

  static createStrategy(pattern: PatternType, context: QuoteContext): CrossChainQuoteStrategy {
    const StrategyClass = STRATEGIES[pattern]

    if (!StrategyClass) {
      throw new BridgeTradeError(`No strategy found for pattern: ${pattern}`)
    }

    return new StrategyClass(context)
  }

  static createStrategyForContext(context: QuoteContext): CrossChainQuoteStrategy {
    const pattern = this.determinePattern(context.routes, context.baseCurrencyAmount.currency, context.quoteCurrency)

    return this.createStrategy(pattern, context)
  }
}
