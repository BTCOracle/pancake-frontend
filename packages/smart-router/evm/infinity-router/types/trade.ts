import { Currency, CurrencyAmount, TradeType } from '@pancakeswap/sdk'
import { AbortControl } from '@pancakeswap/utils/abortControl'

import { BaseTradeConfig, Pool, Route, SmartRouterTrade } from '../../v3-router/types'
import { Graph } from './graph'

export type GasUseInfo = {
  gasUseEstimate: bigint
  gasUseEstimateBase: CurrencyAmount<Currency>
  gasUseEstimateQuote: CurrencyAmount<Currency>
  inputAmountWithGasAdjusted: CurrencyAmount<Currency>
  outputAmountWithGasAdjusted: CurrencyAmount<Currency>
}

export type InfinityRoute = Omit<Route, 'g'> & GasUseInfo

export type TradeConfig = Omit<BaseTradeConfig, 'poolProvider' | 'allowedPoolTypes'> & {
  candidatePools: Pool[]
} & AbortControl

export type InfinityTrade<TTradeType extends TradeType> = Omit<
  SmartRouterTrade<TTradeType>,
  'gasEstimateInUSD' | 'blockNumber' | 'routes' | 'gasEstimate'
> &
  GasUseInfo & {
    routes: InfinityRoute[]
    graph: Graph
  }

export type InfinityTradeWithoutGraph<TTradeType extends TradeType> = Omit<InfinityTrade<TTradeType>, 'graph'>
