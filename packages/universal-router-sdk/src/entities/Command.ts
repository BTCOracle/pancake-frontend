import { RoutePlanner } from '../utils/RoutePlanner'
import { PaymentOptions } from './types'

export type TradeConfig = PaymentOptions & {
  allowRevert: boolean
}

export enum RouterTradeType {
  PancakeSwapTrade = 'PancakeSwapTrade',
  // NFTTrade = 'NFTTrade',
  UnwrapWETH = 'UnwrapWETH',
}

// interface for entities that can be encoded as a Universal Router command
export interface Command {
  tradeType: RouterTradeType
  encode(planner: RoutePlanner, config: PaymentOptions): void
}
