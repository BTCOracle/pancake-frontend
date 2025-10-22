import dayjs from 'dayjs'
import { ApiTransaction, Transaction, TransactionType } from 'state/info/types'
import { safeGetAddress } from 'utils/safeGetAddress'
import { Percent } from '@pancakeswap/swap-sdk-core'

export function shortenAddress(address: string, chars = 4): string {
  const parsed = safeGetAddress(address)
  if (!parsed) {
    throw Error(`Invalid 'address' parameter '${address}'.`)
  }
  return `${parsed.substring(0, chars + 2)}...${parsed.substring(42 - chars)}`
}
export function feeTierPercent(fee: number): string {
  return `${new Percent(fee, 1000000).toSignificant(2)}%`
}

export const currentTimestamp = () => new Date().getTime()

export function transformTransaction(transaction: ApiTransaction): Transaction {
  return {
    type:
      transaction.type === 'mint'
        ? TransactionType.MINT
        : transaction.type === 'burn'
        ? TransactionType.BURN
        : TransactionType.SWAP,
    hash: transaction.transactionHash,
    timestamp: dayjs(transaction.timestamp as string)
      .unix()
      .toString(),
    sender: transaction.origin ?? '',
    token0Symbol: transaction.token0.symbol,
    token1Symbol: transaction.token1.symbol,
    token0Address: transaction.token0.id,
    token1Address: transaction.token1.id,
    amountUSD: parseFloat(transaction.amountUSD),
    amountToken0: parseFloat(transaction.amount0),
    amountToken1: parseFloat(transaction.amount1),
  }
}
