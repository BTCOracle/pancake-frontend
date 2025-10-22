import { useAtom } from 'jotai/index'
import { useEffect } from 'react'
import { useInitialBlockTimestamp } from 'state/block/hooks'
import { txReceiptAtom } from 'state/farmsV4/state/accountPositions/atom'
import { TransactionType } from 'state/transactions/actions'
import { useAllSortedRecentTransactions } from 'state/transactions/hooks'

const LIQUIDITY_TRANSACTION_TYPES: TransactionType[] = [
  'add-liquidity',
  'add-liquidity-v3',
  'remove-liquidity-v3',
  'remove-liquidity',
  'increase-liquidity-v3',
  'zap-liquidity-v3',
  'add-liquidity-infinity-bin',
  'add-liquidity-infinity-cl',
  'remove-liquidity-infinity-bin',
  'remove-liquidity-infinity-cl',
]

export const useUpdateLatestTxReceipt = () => {
  const initialBlockTimestamp = useInitialBlockTimestamp()
  const [latestTxReceipt, setLatestTxReceipt] = useAtom(txReceiptAtom)
  const allTransactions = useAllSortedRecentTransactions()

  useEffect(() => {
    if (initialBlockTimestamp > 0) {
      const newestReceipt = Object.entries(allTransactions)
        .flatMap(([_, txs]) =>
          Object.values(txs)
            .filter((tx) => tx.type && LIQUIDITY_TRANSACTION_TYPES.includes(tx.type))
            .map(({ receipt, confirmedTime }) =>
              receipt && confirmedTime && receipt.status === 1 && confirmedTime > initialBlockTimestamp
                ? {
                    blockHash: receipt.blockHash,
                    confirmedTime,
                  }
                : undefined,
            )
            .filter(Boolean),
        )
        .reduce(
          (latest, current) => (!latest || current!.confirmedTime > latest.confirmedTime ? current : latest),
          undefined,
        )

      if (newestReceipt && newestReceipt.confirmedTime > (latestTxReceipt?.confirmedTime || 0)) {
        setLatestTxReceipt(newestReceipt)
      }
    }
  }, [initialBlockTimestamp, allTransactions, latestTxReceipt, setLatestTxReceipt])
}
