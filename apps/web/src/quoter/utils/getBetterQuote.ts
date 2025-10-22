import { TradeType } from '@pancakeswap/swap-sdk-core'
import { QuoteResult, UseBetterQuoteOptions } from '../quoter.types'

export function getBetterQuote<A extends QuoteResult, B extends QuoteResult>(
  quoteA?: A,
  quoteB?: B,
  options?: UseBetterQuoteOptions,
): A | B | undefined
export function getBetterQuote<A extends QuoteResult, B extends QuoteResult>(
  quoteA: A,
  quoteB: B,
  options: UseBetterQuoteOptions | undefined,
): A | B
export function getBetterQuote<A extends QuoteResult, B extends QuoteResult>(
  quoteA?: A,
  quoteB?: B,
  options?: UseBetterQuoteOptions,
): A | B | undefined {
  if (!quoteB?.trade || (!quoteA?.trade && !quoteB?.trade)) {
    return quoteA
  }

  if (!quoteA?.trade) {
    return quoteB
  }

  if (quoteA.isLoading && !quoteA.error) {
    return quoteA
  }

  const betterTrade = getBetterQuoteTrade(quoteA.trade, quoteB.trade, options)
  return betterTrade === quoteA.trade ? quoteA : quoteB
}

interface QuoteTrade {
  tradeType: TradeType
  inputAmount: any
  outputAmount: any
  inputAmountWithGasAdjusted?: any
  outputAmountWithGasAdjusted?: any
}

// isBetterQuoteTrade is used to compare two quotes with one base currency and one quote currency
export function isBetterQuoteTrade(tradeA: QuoteTrade, tradeB: QuoteTrade, options?: UseBetterQuoteOptions): boolean {
  const { factorGasCost = false } = options || {}

  if (tradeA.tradeType === TradeType.EXACT_INPUT) {
    const outputAmountB = factorGasCost
      ? tradeB.outputAmountWithGasAdjusted ?? tradeB.outputAmount
      : tradeB.outputAmount
    const outputAmountA = factorGasCost
      ? tradeA.outputAmountWithGasAdjusted ?? tradeA.outputAmount
      : tradeA.outputAmount

    return outputAmountB.greaterThan(outputAmountA)
  }

  const inputAmountB = factorGasCost ? tradeB.inputAmountWithGasAdjusted ?? tradeB.inputAmount : tradeB.inputAmount
  const inputAmountA = factorGasCost ? tradeA.inputAmountWithGasAdjusted ?? tradeA.inputAmount : tradeA.inputAmount

  return inputAmountB.lessThan(inputAmountA)
}
export function getBetterQuoteTrade(
  tradeA: QuoteTrade,
  tradeB: QuoteTrade,
  options?: UseBetterQuoteOptions,
): QuoteTrade {
  const { factorGasCost = false } = options || {}

  if (tradeA.tradeType === TradeType.EXACT_INPUT) {
    const outputAmountB = factorGasCost
      ? tradeB.outputAmountWithGasAdjusted ?? tradeB.outputAmount
      : tradeB.outputAmount
    const outputAmountA = factorGasCost
      ? tradeA.outputAmountWithGasAdjusted ?? tradeA.outputAmount
      : tradeA.outputAmount

    return outputAmountB.greaterThan(outputAmountA) ? tradeB : tradeA
  }

  const inputAmountB = factorGasCost ? tradeB.inputAmountWithGasAdjusted ?? tradeB.inputAmount : tradeB.inputAmount
  const inputAmountA = factorGasCost ? tradeA.inputAmountWithGasAdjusted ?? tradeA.inputAmount : tradeA.inputAmount

  return inputAmountB.lessThan(inputAmountA) ? tradeB : tradeA
}
