import type { Pool, Route } from '@pancakeswap/routing-sdk'
import { InfinityBinPool, InfinityCLPool } from '@pancakeswap/routing-sdk-addon-infinity'
import { StablePool } from '@pancakeswap/routing-sdk-addon-stable-swap'
import { V2Pool } from '@pancakeswap/routing-sdk-addon-v2'
import { V3Pool } from '@pancakeswap/routing-sdk-addon-v3'
import { Currency, CurrencyAmount } from '@pancakeswap/swap-sdk-core'
import type { PublicClient } from 'viem'

export type QuoteRoute<P extends Pool = Pool> = Pick<Route<P>, 'path' | 'pools'> & {
  amount: CurrencyAmount<Currency>
}

export type FetchQuoteParams<P extends Pool = Pool> = {
  client: PublicClient
  route: QuoteRoute<P>
}

export type FetchQuotesParams<P extends Pool = Pool> = {
  client: PublicClient
  routes: QuoteRoute<P>[]
}

export type Quote = {
  quote: CurrencyAmount<Currency>
  gasUseEstimate: bigint
}

export type FetchQuote<P extends Pool = Pool> = (params: FetchQuoteParams<P>) => Promise<Quote | undefined>

export type FetchQuotes<P extends Pool = Pool> = (params: FetchQuotesParams<P>) => Promise<(Quote | undefined)[]>

export enum InfinityMixedQuoterActions {
  SS_2_EXACT_INPUT_SINGLE = 0,
  SS_3_EXACT_INPUT_SINGLE = 1,
  V2_EXACT_INPUT_SINGLE = 2,
  V3_EXACT_INPUT_SINGLE = 3,
  INFI_CL_EXACT_INPUT_SINGLE = 4,
  INFI_BIN_EXACT_INPUT_SINGLE = 5,
}

export type InfinitySupportedPool = InfinityCLPool | InfinityBinPool

export type V3SupportedPool = V3Pool | V2Pool | StablePool

export type SupportedPool = InfinitySupportedPool | V3SupportedPool
