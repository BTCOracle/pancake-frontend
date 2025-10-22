import { TransactionDetails } from 'state/transactions/reducer'
import { UserBridgeOrder } from 'views/Swap/Bridge/types'
import { GetXOrderReceiptResponseOrder } from 'views/Swap/x/api'

export type AmmTransactionItem = {
  type: 'tx'
  chainId: number
  item: TransactionDetails
}

export type XTransactionItem = {
  type: 'xOrder'
  item: GetXOrderReceiptResponseOrder
}

export type CrossChainTransactionItem = {
  type: 'crossChainOrder'
  order: UserBridgeOrder
}

export type TransactionItem = AmmTransactionItem | XTransactionItem | CrossChainTransactionItem
