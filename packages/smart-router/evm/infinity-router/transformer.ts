import { ChainId } from '@pancakeswap/chains'
import { TradeType } from '@pancakeswap/swap-sdk-core'

import {
  SerializedCurrency,
  SerializedCurrencyAmount,
  SerializedPool,
  parseCurrency,
  parseCurrencyAmount,
  parsePool,
  serializeCurrency,
  serializeCurrencyAmount,
  serializePool,
} from '../v3-router/utils/transformer'
import { InfinityRoute, InfinityTrade } from './types'

export type SerializedGasUseInfo = {
  gasUseEstimate: string
  gasUseEstimateBase: SerializedCurrencyAmount
  gasUseEstimateQuote: SerializedCurrencyAmount
  inputAmountWithGasAdjusted: SerializedCurrencyAmount
  outputAmountWithGasAdjusted: SerializedCurrencyAmount
}

export type SerializedInfinityRoute = Omit<
  InfinityRoute,
  | 'pools'
  | 'path'
  | 'input'
  | 'output'
  | 'inputAmount'
  | 'outputAmount'
  | 'gasUseEstimate'
  | 'gasUseEstimateBase'
  | 'gasUseEstimateQuote'
  | 'inputAmountWithGasAdjusted'
  | 'outputAmountWithGasAdjusted'
> &
  SerializedGasUseInfo & {
    pools: SerializedPool[]
    path: SerializedCurrency[]
    inputAmount: SerializedCurrencyAmount
    outputAmount: SerializedCurrencyAmount
  }

export type SerializedInfinityTrade = Omit<
  InfinityTrade<TradeType>,
  | 'inputAmount'
  | 'outputAmount'
  | 'gasUseEstimate'
  | 'gasUseEstimateBase'
  | 'gasUseEstimateQuote'
  | 'routes'
  | 'graph'
  | 'inputAmountWithGasAdjusted'
  | 'outputAmountWithGasAdjusted'
> &
  SerializedGasUseInfo & {
    inputAmount: SerializedCurrencyAmount
    outputAmount: SerializedCurrencyAmount
    routes: SerializedInfinityRoute[]
  }

export function serializeRoute(route: InfinityRoute): SerializedInfinityRoute {
  return {
    ...route,
    pools: route.pools.map(serializePool),
    path: route.path.map(serializeCurrency),
    inputAmount: serializeCurrencyAmount(route.inputAmount),
    outputAmount: serializeCurrencyAmount(route.outputAmount),
    gasUseEstimate: String(route.gasUseEstimate),
    gasUseEstimateBase: serializeCurrencyAmount(route.gasUseEstimateBase),
    gasUseEstimateQuote: serializeCurrencyAmount(route.gasUseEstimateQuote),
    inputAmountWithGasAdjusted: serializeCurrencyAmount(route.inputAmountWithGasAdjusted),
    outputAmountWithGasAdjusted: serializeCurrencyAmount(route.outputAmountWithGasAdjusted),
  }
}

export function parseRoute(chainId: ChainId, route: SerializedInfinityRoute): InfinityRoute {
  return {
    ...route,
    pools: route.pools.map((p) => parsePool(chainId, p)),
    path: route.path.map((c) => parseCurrency(chainId, c)),
    inputAmount: parseCurrencyAmount(chainId, route.inputAmount),
    outputAmount: parseCurrencyAmount(chainId, route.outputAmount),
    gasUseEstimate: BigInt(route.gasUseEstimate),
    gasUseEstimateBase: parseCurrencyAmount(chainId, route.gasUseEstimateBase),
    gasUseEstimateQuote: parseCurrencyAmount(chainId, route.gasUseEstimateQuote),
    inputAmountWithGasAdjusted: parseCurrencyAmount(chainId, route.inputAmountWithGasAdjusted),
    outputAmountWithGasAdjusted: parseCurrencyAmount(chainId, route.outputAmountWithGasAdjusted),
  }
}

type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

export function serializeTrade(trade: Optional<InfinityTrade<TradeType>, 'graph'>): SerializedInfinityTrade {
  const { graph: _graph, ...rest } = trade
  return {
    ...rest,
    inputAmount: serializeCurrencyAmount(trade.inputAmount),
    outputAmount: serializeCurrencyAmount(trade.outputAmount),
    routes: trade.routes.map(serializeRoute),
    gasUseEstimate: trade.gasUseEstimate.toString(),
    gasUseEstimateBase: serializeCurrencyAmount(trade.gasUseEstimateBase),
    gasUseEstimateQuote: serializeCurrencyAmount(trade.gasUseEstimateQuote),
    inputAmountWithGasAdjusted: serializeCurrencyAmount(trade.inputAmountWithGasAdjusted),
    outputAmountWithGasAdjusted: serializeCurrencyAmount(trade.outputAmountWithGasAdjusted),
  }
}

export function parseTrade<tradeType extends TradeType = TradeType>(
  chainId: ChainId,
  trade: SerializedInfinityTrade,
): Omit<InfinityTrade<tradeType>, 'graph'> {
  return {
    ...trade,
    tradeType: trade.tradeType as tradeType,
    inputAmount: parseCurrencyAmount(chainId, trade.inputAmount),
    outputAmount: parseCurrencyAmount(chainId, trade.outputAmount),
    routes: trade.routes.map((r) => parseRoute(chainId, r)),
    gasUseEstimate: trade.gasUseEstimate ? BigInt(trade.gasUseEstimate) : 0n,
    gasUseEstimateBase: parseCurrencyAmount(chainId, trade.gasUseEstimateBase),
    gasUseEstimateQuote: parseCurrencyAmount(chainId, trade.gasUseEstimateQuote),
    inputAmountWithGasAdjusted: parseCurrencyAmount(chainId, trade.inputAmountWithGasAdjusted),
    outputAmountWithGasAdjusted: parseCurrencyAmount(chainId, trade.outputAmountWithGasAdjusted),
  }
}
