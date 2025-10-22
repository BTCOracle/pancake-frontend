import type { ChainId } from '@pancakeswap/chains'
import type { IfoStatus } from '@pancakeswap/ifos'
import type { Currency, CurrencyAmount, Price } from '@pancakeswap/swap-sdk-core'
import type { ReactNode } from 'react'
import type { Address } from 'viem'
import type { getIFOContract } from './hooks/ifo/useIFOContract'

/**
 * i18n text format for JSON configs
 */
export type I18nText = { i18nText: string }

/**
 * Currency config from JSON that needs to be converted to Token
 */
export type CurrencyConfig = {
  chainId?: number
  address: string
  decimals: number
  symbol: string
  name: string
}

export interface PoolInfo {
  pid: number
  /**
   * token address that is used to stake in the pool
   */
  poolToken: Address
  /**
   * Amount of tokens raised in the pool
   */
  raisingAmountPool: bigint
  /**
   * Amount of tokens offered in the pool
   *
   * if pool is not offering tokens, it will be 0
   */
  offeringAmountPool: bigint
  /**
   * Maximum amount of tokens a user can stake in the pool
   */
  capPerUserInLP: bigint
  /**
   * If the pool has tax on overflow
   */
  hasTax: boolean
  /**
   * Total amount of tokens staked in the pool
   */
  totalAmountPool: bigint
  /**
   * Sum of taxes collected from overflow
   */
  sumTaxesOverflow: bigint
  /**
   * Flat tax rate for overflow
   */
  flatTaxRate: bigint
  /**
   * Current deposit tax rate expressed as a percentage (0-1)
   */
  feeTier: number
  /**
   * Currency used to stake in the pool
   */
  stakeCurrency?: Currency
  /**
   * Price of the offering token denominated in the staking currency
   */
  price?: Price<Currency, Currency>
  /**
   * Total raising amount in the staking currency
   */
  raise?: CurrencyAmount<Currency>
  /**
   * Total offering amount in the offering currency
   */
  saleAmount?: CurrencyAmount<Currency>
  /**
   * Whether the staking token for this pool is CAKE
   */
  isCakePool?: boolean
  /**
   * Estimated CAKE amount to be burned for this pool
   */
  estimatedCakeToBurn?: CurrencyAmount<Currency>
}

export type IFOConfig = {
  id: string
  icon: string
  projectUrl: string
  twitterLink?: string
  tgLink?: string
  chainId: ChainId
  bannerUrl: string
  tgeTitle: I18nText
  description: I18nText
  ineligibleContent?: I18nText
  contractAddress: Address
  tokenAddress?: Address
  faqs?: IFOFAQs

  /**
   * Preset data to show until we get the production contract address
   */
  presetData?: {
    startTimestamp: number
    endTimestamp: number
    offeringCurrency: Currency
    totalSalesAmount: number
    stakeCurrency0?: Currency
    stakeCurrency1?: Currency
    preSaleDurationText: I18nText
    pools: {
      pid: number
      stakeCurrency: Currency
      pricePerToken: string
      raiseAmountText: string
    }[]
  }
}

export type IFOFAQs = Array<{ title: I18nText; description: I18nText }>

export interface VestingInfo {
  startTime: number
  percentage: number
  cliff: number
  duration: number
  rate: number
}

export interface IfoInfo {
  startTimestamp: number
  endTimestamp: number
  duration: number
  totalSalesAmount: CurrencyAmount<Currency> | undefined
  status: IfoStatus
  vestingInfo?: VestingInfo
  offeringCurrency?: Currency
}

export interface IfoPoolDisplay {
  flatTaxRate: number
  totalCommittedPercent: string
  raiseAmountText: string
}

export interface IfoDisplay {
  startDisplay: { date: string; time: string }
  endDisplay: { date: string; time: string }
  preSaleDurationText: string
  pools: IfoPoolDisplay[]
}

export type IFOUserStatus = {
  stakedAmount: CurrencyAmount<Currency> | undefined
  stakeRefund: CurrencyAmount<Currency> | undefined
  claimableAmount: CurrencyAmount<Currency> | undefined
  claimed: boolean | undefined
  tax: CurrencyAmount<Currency> | undefined
}

export interface IfoV2ContextType {
  chainId: number
  ifoContract: ReturnType<typeof getIFOContract>
  config: IFOConfig
  info?: IfoInfo
  pools?: PoolInfo[]
  users?: (IFOUserStatus | undefined)[]
}
