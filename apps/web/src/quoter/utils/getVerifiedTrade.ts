import { fetchQuotes, Quote } from '@pancakeswap/routing-sdk-addon-quoter'
import { InfinityRouter, RouteType } from '@pancakeswap/smart-router'
import { CurrencyAmount, Fraction, TradeType } from '@pancakeswap/swap-sdk-core'

import { toRoutingSDKTrade } from 'utils/convertTrade'
import { getViemClients } from 'utils/viem'

export async function getVerifiedTrade(trade?: InfinityRouter.InfinityTradeWithoutGraph<TradeType>) {
  if (!trade) throw new Error(`Invalid trade ${trade} to verify`)
  const isExactIn = trade.tradeType === TradeType.EXACT_INPUT
  const quoteCurrency = isExactIn ? trade.outputAmount.currency : trade.inputAmount.currency
  // For pure v2 / ss routes, we don't need to verify
  const indexesOfRoutesToVerify = isExactIn
    ? trade.routes.map((_, index) => index)
    : trade.routes.reduce<number[]>(
        (acc, r, index) => (r.type !== RouteType.V2 && r.type !== RouteType.STABLE ? [...acc, index] : acc),
        [],
      )
  if (!indexesOfRoutesToVerify.length) {
    return trade
  }

  const getQuotePosition = (routeIndex: number) => indexesOfRoutesToVerify.findIndex((i) => i === routeIndex)
  const sdkTrade = toRoutingSDKTrade(trade)
  const quoteRoutes = sdkTrade.routes
    .filter((_, index) => indexesOfRoutesToVerify.includes(index))
    .map((r) => ({
      ...r,
      amount: isExactIn ? r.inputAmount : r.outputAmount,
    }))
  const quotes = await fetchQuotes({
    routes: quoteRoutes,
    client: getViemClients({ chainId: trade.inputAmount.currency.chainId }),
  })
  if (quotes.some((q) => q === undefined)) {
    throw new Error('Fail to validate')
  }
  const { quote, gasUseEstimate } = trade.routes.reduce<NonNullable<Quote>>(
    (total, r, index) => {
      const position = getQuotePosition(index)
      const q =
        position !== -1
          ? quotes[position]
          : { quote: isExactIn ? r.outputAmount : r.inputAmount, gasUseEstimate: r.gasUseEstimate }
      return {
        quote: total.quote.add(CurrencyAmount.fromRawAmount(quoteCurrency, q!.quote.quotient)),
        gasUseEstimate: total.gasUseEstimate + q!.gasUseEstimate,
      }
    },
    {
      quote: CurrencyAmount.fromRawAmount(quoteCurrency, 0n),
      gasUseEstimate: 0n,
    },
  )
  return {
    ...trade,
    routes: trade.routes.map((r, index) => {
      const quotePosition = getQuotePosition(index)
      const hasVerifiedQuote = quotePosition !== -1
      return {
        ...r,
        inputAmount: isExactIn || !hasVerifiedQuote ? r.inputAmount : quotes[quotePosition]?.quote,
        outputAmount: isExactIn && hasVerifiedQuote ? quotes[quotePosition]?.quote : r.outputAmount,
        ...(hasVerifiedQuote ? reviseGasUseEstimate(trade.tradeType, r, quotes[quotePosition]!.gasUseEstimate) : {}),
      }
    }),
    inputAmount: isExactIn ? trade.inputAmount : quote,
    outputAmount: isExactIn ? quote : trade.outputAmount,
    ...reviseGasUseEstimate(trade.tradeType, trade, gasUseEstimate),
  }
}

type GasUseEstimate = Pick<
  InfinityRouter.InfinityTradeWithoutGraph<TradeType>,
  | 'gasUseEstimate'
  | 'inputAmountWithGasAdjusted'
  | 'outputAmountWithGasAdjusted'
  | 'gasUseEstimateBase'
  | 'gasUseEstimateQuote'
>

function reviseGasUseEstimate(
  tradeType: TradeType,
  estimate: GasUseEstimate,
  actualGasUseEstimate: bigint,
): GasUseEstimate {
  const isExactIn = tradeType === TradeType.EXACT_INPUT
  const factor = new Fraction(actualGasUseEstimate, estimate.gasUseEstimate)
  const gasUseEstimateBase =
    factor.denominator > 0n
      ? estimate.gasUseEstimateBase.multiply(factor)
      : CurrencyAmount.fromRawAmount(estimate.gasUseEstimateQuote.currency, 0n)
  const gasUseEstimateQuote =
    factor.denominator > 0n
      ? estimate.gasUseEstimateQuote.multiply(factor)
      : CurrencyAmount.fromRawAmount(estimate.gasUseEstimateQuote.currency, 0n)
  const inputAmountWithGasAdjusted = isExactIn
    ? estimate.inputAmountWithGasAdjusted
    : estimate.inputAmountWithGasAdjusted.subtract(estimate.gasUseEstimateQuote).add(gasUseEstimateQuote)
  const outputAmountWithGasAdjusted = isExactIn
    ? estimate.outputAmountWithGasAdjusted.add(estimate.gasUseEstimateQuote).subtract(gasUseEstimateQuote)
    : estimate.outputAmountWithGasAdjusted

  return {
    gasUseEstimateBase,
    gasUseEstimateQuote,
    inputAmountWithGasAdjusted,
    outputAmountWithGasAdjusted,
    gasUseEstimate: actualGasUseEstimate,
  }
}
