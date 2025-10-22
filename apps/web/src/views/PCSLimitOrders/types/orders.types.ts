import { Address } from 'viem/accounts'

export interface OrderHistoryResponse {
  startCursor: string
  endCursor: string
  hasNextPage?: boolean
  hasPrevPage?: boolean
  rows: ResponseOrder[]
}

export interface PaginationInfo {
  startCursor: string
  endCursor: string
  hasNextPage?: boolean
  hasPrevPage?: boolean
}

export interface PaginationParams {
  before?: string
  after?: string
}

export interface ResponseOrder {
  order_id: string
  pool_id: Address
  owner: Address
  liquidity: string
  status: OrderStatus
  updated_at: string
  zero_for_one: boolean
  tick_lower: number
  transaction_hash: string
  amount0: string
  amount1: string
  original_amount_0: string
  original_amount_1: string
}

export enum OrderStatus {
  Open = 'Open',
  Filled = 'Filled',
  PartiallyFilled = 'Partially_Filled',
  Cancelled = 'Cancelled',
  Withdrawn = 'Withdrawn',
}
