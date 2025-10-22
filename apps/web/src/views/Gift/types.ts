import { CurrencyAmount, NativeCurrency, Token } from '@pancakeswap/swap-sdk-core'
import { QueryParams } from './utils/ApiAdapter'

export enum GiftStatus {
  PENDING = 'PENDING',
  CLAIMED = 'CLAIMED',
  EXPIRED = 'EXPIRED',
  REQUESTED_CLAIM = 'REQUESTED_CLAIM',
  CANCELLED = 'CANCELLED',
  UNCLAIMABLE = 'UNCLAIMABLE',
}

export interface GiftInfoResponse {
  codeHash: string
  token: string
  tokenAmount: string
  nativeAmount: string
  createTransactionHash: string
  status: GiftStatus
  claimerAddress: string | null
  actionTransactionHash: string | null // the transaction for CLAIMED/EXPIRED/CANCELLED
  timestamp: string // ISOString
  expiryTimestamp: string // ISOString
  creatorAddress: string
  claimTimeStamp?: string
  cancelTimeStamp?: string
}

export interface GiftInfo extends GiftInfoResponse {
  // currencyAmount is null when the gift is for native token and the token is not found
  // currencyAmount  is undefined when token is not in allTokensList, means it need to be searched onchain
  currencyAmount?: CurrencyAmount<Token> | null
  nativeCurrencyAmount: CurrencyAmount<NativeCurrency>
}

export enum GiftApiStatus {
  SUCCESS = 'success',
  FAILED = 'failed',
}

export interface GiftApiResponse<T> {
  status: GiftApiStatus
  message?: string // if status is failed
  data?: T
}

export interface ClaimGiftRequest {
  chainId: number
  address: string
  code: string
}

export interface ClaimGiftResponse {
  status: GiftApiStatus
  message?: string
  codeHash: string
}

export interface ClaimGiftParams {
  code: string
}

export interface CreateGiftParams {
  tokenAmount: CurrencyAmount<Token | NativeCurrency>
  code: string
  nativeAmount?: CurrencyAmount<NativeCurrency>
}

// Specific query parameters for gift list API - now type-safe with abstract QueryParams
export interface GiftListApiQueryParams extends QueryParams {
  chainId: number
  address?: string
  claimerAddress?: string
  hasNative?: boolean
  cursor?: string // 2025-07-05T20:42:06.000Z
  // only from 1 -> 20
  pageSize?: number
  operand?: 'AND' | 'OR'
}
