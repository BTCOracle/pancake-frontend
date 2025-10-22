import { ChainId } from '@gelatonetwork/limit-orders-lib'
import { AVERAGE_CHAIN_BLOCK_TIMES } from '@pancakeswap/chains'
import { useFetchBlockData } from '@pancakeswap/wagmi'
import { BSC_BLOCK_TIME } from 'config'
import { CHAINS } from 'config/chains'
import { PUBLIC_NODES } from 'config/nodes'
import memoize from 'lodash/memoize'
import { useCallback } from 'react'
import { RetryableError, retry, retryExp } from 'state/multicall/retry'
import { fallbackWithRank } from 'utils/fallbackWithRank'
import {
  BlockNotFoundError,
  GetTransactionReceiptParameters,
  HttpRequestError,
  PublicClient,
  TransactionNotFoundError,
  TransactionReceipt,
  TransactionReceiptNotFoundError,
  WaitForTransactionReceiptTimeoutError,
  createPublicClient,
  custom,
  http,
} from 'viem'
import { usePublicClient } from 'wagmi'
import { useW3WConfig } from 'wallet/W3WConfigContext'
import { useActiveChainId } from './useActiveChainId'

export const getViemClientsPublicNodes = memoize((w3WConfig = false) => {
  return CHAINS.reduce((prev, cur) => {
    return {
      ...prev,
      [cur.id]: createPublicClient({
        chain: cur,
        transport:
          w3WConfig && typeof window !== 'undefined' && window.ethereum
            ? custom(window.ethereum as any)
            : fallbackWithRank([...PUBLIC_NODES[cur.id].map((url) => http(url, { timeout: 15_000 }))]),
        batch: {
          multicall: {
            batchSize: 1024 * 200,
            wait: 16,
          },
        },
        pollingInterval: 6_000,
      }),
    }
  }, {} as Record<ChainId, PublicClient>)
})

export type PublicNodeWaitForTransactionParams = GetTransactionReceiptParameters & {
  chainId?: number
}

export function usePublicNodeWaitForTransaction(chainId_?: number) {
  const { chainId: activeChainId } = useActiveChainId()
  const chainId = chainId_ ?? activeChainId
  const provider = usePublicClient({ chainId })
  const w3WConfig = useW3WConfig()
  const refetchBlockData = useFetchBlockData(chainId)

  const waitForTransaction_ = useCallback(
    async (opts: PublicNodeWaitForTransactionParams): Promise<TransactionReceipt> => {
      const selectedChain = opts?.chainId ?? chainId
      const getTransaction = async () => {
        try {
          // our custom node might be late to sync up
          if (selectedChain && getViemClientsPublicNodes(w3WConfig)[selectedChain]) {
            const receipt = await getViemClientsPublicNodes(w3WConfig)[selectedChain].getTransactionReceipt({
              hash: opts.hash,
            })
            if (receipt.status === 'success') {
              refetchBlockData()
            }
            return receipt
          }

          if (!provider) return undefined

          const receipt = await provider.getTransactionReceipt({ hash: opts.hash })
          if (receipt.status === 'success') {
            refetchBlockData()
          }
          return receipt
        } catch (error) {
          if (error instanceof TransactionNotFoundError) {
            throw new RetryableError(`Transaction not found: ${opts.hash}`)
          } else if (error instanceof TransactionReceiptNotFoundError) {
            throw new RetryableError(`Transaction receipt not found: ${opts.hash}`)
          } else if (error instanceof BlockNotFoundError) {
            throw new RetryableError(`Block not found for transaction: ${opts.hash}`)
          } else if (error instanceof WaitForTransactionReceiptTimeoutError) {
            throw new RetryableError(`Timeout reached when fetching transaction receipt: ${opts.hash}`)
          } else if (
            error instanceof HttpRequestError &&
            (error.details?.includes('Load failed') || error.details?.includes('Failed to fetch'))
          ) {
            // retry on network error
            throw new RetryableError(
              `Network error when request to ${error.url} failed: ${error.status}, ${error.details}`,
            )
          }
          throw error
        }
      }
      const bufferedAvgBlockTime =
        (selectedChain ? AVERAGE_CHAIN_BLOCK_TIMES[selectedChain] : BSC_BLOCK_TIME) * 1000 + 1000
      return retryExp(getTransaction, {
        n: 10,
        base: bufferedAvgBlockTime,
        delay: bufferedAvgBlockTime,
        factor: 1.5,
      }).promise as Promise<TransactionReceipt>
    },
    [chainId, provider, refetchBlockData, w3WConfig],
  )

  return {
    waitForTransaction: waitForTransaction_,
  }
}
