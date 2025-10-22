import { BigintIsh, Currency, CurrencyAmount, TradeType } from '@pancakeswap/sdk'
import { AbortControl } from '@pancakeswap/utils/abortControl'

export interface SmartRouterTrade<TTradeType extends TradeType> {
  tradeType: TTradeType
  inputAmount: CurrencyAmount<Currency>
  inputAmountWithGasAdjusted?: CurrencyAmount<Currency>
  outputAmount: CurrencyAmount<Currency>
  outputAmountWithGasAdjusted?: CurrencyAmount<Currency>

  routes: any[]

  gasEstimate: bigint
  gasEstimateInUSD?: CurrencyAmount<Currency>
  blockNumber?: number
  quoteQueryHash?: string
}

export type PriceReferences = {
  quoteCurrencyUsdPrice?: number
  nativeCurrencyUsdPrice?: number
}

export type BaseTradeConfig = {
  gasPriceWei: BigintIsh | (() => Promise<BigintIsh>)
  maxHops?: number
  maxSplits?: number
  distributionPercent?: number
}

export type TradeConfig = BaseTradeConfig & {
  blockNumber?: number | (() => Promise<number>)
  quoterOptimization?: boolean
  quoteId?: string
} & PriceReferences &
  AbortControl

export type RouteConfig = TradeConfig & {
  blockNumber?: number
}

export const AGGREGATOR_SOURCES = {
  METIS: 'metis',
  JUPITERZ: 'jupiterz',
  HASHFLOW: 'hashflow',
  DFLOW: 'dflow',
} as const

export type AggregatorSources = (typeof AGGREGATOR_SOURCES)[keyof typeof AGGREGATOR_SOURCES]
export interface UltraQuoteResponse {
  inputMint: string
  inAmount: string
  outputMint: string
  outAmount: string
  otherAmountThreshold: string
  priceImpactPct: string
  routePlan: {
    swapInfo: {
      inputMint: string
      inAmount: string
      outputMint: string
      outAmount: string
      ammKey: string
      label: string
      feeAmount: `${number}`
      feeMint: string
    }
    percent: number
  }[]
  contextSlot: number
  transaction: string | null
  swapType: 'ultra'
  gasless: boolean
  requestId: string
  prioritizationFeeLamports?: number
  feeBps: number
  router: AggregatorSources
}

// Refer docs here https://dev.jup.ag/docs/api/ultra-api/order
export interface UltraSwapQuoteParams {
  inputMint: string
  outputMint: string
  amount: string
  taker?: string
  swapMode?: 'ExactIn' | 'ExactOut'
  priorityFeeLamports?: number
  referralAccount?: string
  referralFee?: number
}
interface UltraSwapResponseBase {
  signature: string
  code: number
  status: 'Success' | 'Failed'
  slot: string
}

interface UltraSwapResponseSuccess extends UltraSwapResponseBase {
  status: 'Success'
  inputAmountResult: string
  outputAmountResult: string
}

interface UltraSwapResponseFailed extends UltraSwapResponseBase {
  status: 'Failed'
  message: string
  error: string
}

export type UltraSwapResponse = UltraSwapResponseSuccess | UltraSwapResponseFailed

interface Router {
  icon: string
  id: AggregatorSources
  name: string
}

export type RouterResponse = Router[]

interface TokenBalance {
  amount: string // Raw token amount as string
  uiAmount: number // Formatted amount with decimals
  slot: number // Solana slot number
  isFrozen: boolean // Whether the token account is frozen
}

export type BalanceResponse = Record<string, TokenBalance>
