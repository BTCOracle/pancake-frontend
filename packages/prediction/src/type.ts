import { ChainId } from '@pancakeswap/chains'
import { Currency } from '@pancakeswap/sdk'
import { Address } from 'viem'
import { SupportedChainId } from './constants/supportedChains'

export enum PredictionContractVersion {
  /** Old Predictions Contract */
  V1 = 'V1',

  /** For Native Tokens */
  V2 = 'V2',

  /** Gas-optimized version of V2 for Native Tokens */
  V2_1 = 'V2_1',

  /** For ERC20 tokens */
  V3 = 'V3',
}

export enum PredictionSupportedSymbol {
  BNB = 'BNB',
  CAKE = 'CAKE',
  ETH = 'ETH',
  WBTC = 'WBTC',
  BTC = 'BTC',
}

export enum BetPosition {
  BULL = 'Bull',
  BEAR = 'Bear',
  HOUSE = 'House',
}

export enum PredictionStatus {
  INITIAL = 'initial',
  LIVE = 'live',
  PAUSED = 'paused',
  ERROR = 'error',
}

export enum PredictionsChartView {
  TradingView = 'TradingView',
  Chainlink = 'Chainlink Oracle',
  Pyth = 'Pyth Oracle',
}

interface MutableRefObject<T> {
  current: T
}

type AIPredictionConfig = {
  aiPriceDecimals?: number
  useAlternateSource?: MutableRefObject<boolean>
}

export interface PredictionConfig {
  version: PredictionContractVersion

  betCurrency: Currency // The currency that is used to bet on the prediction
  predictionCurrency: Currency // The currency that the user is predicting price for

  address: Address

  api: string // Subgraph API endpoint for fetching Bet History

  paused?: boolean // If the prediction market is paused, set to true

  chainlinkOracleAddress?: Address // All EVM chain are using chainlink oracle, but not include zkSync chain
  galetoOracleAddress?: Address // Only zkSync chain use galeto oracle

  tokenBackgroundColor?: string // For selector svg token for prediction page
  displayedDecimals: number

  // Decimals to accommodate varying price sources
  lockPriceDecimals?: number
  closePriceDecimals?: number
  balanceDecimals?: number

  ai?: AIPredictionConfig // AI-based prediction market
}

export type ContractAddresses<T extends ChainId = SupportedChainId> = {
  [chainId in T]: Address
}

export type EndPointType<T extends ChainId = SupportedChainId> = {
  [chainId in T]: string
}

export type LeaderboardMinRoundsPlatedType<T extends PredictionSupportedSymbol> = {
  [PredictionSupportedSymbol in T]: number
}
