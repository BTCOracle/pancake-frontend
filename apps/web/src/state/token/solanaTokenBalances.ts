import { useMemo, useCallback } from 'react'

import BN from 'bignumber.js'
import { useAtomValue } from 'jotai'
import { useQueryClient } from '@tanstack/react-query'
import { BIG_ZERO } from '@pancakeswap/utils/bigNumber'
import { SOLANA_BALANCES_QUERY_KEY, walletBalancesAtomFamily } from './atomFamily'

/**
 * useSolanaTokenBalance get a single token's balance for a wallet.
 * There is no need to cache the balance of a single token
 * because user want to see the latest balance as soon as possible.
 * This balance will be refetched every 10 seconds.
 */
export function useSolanaTokenBalance(
  walletAddress?: string | null,
  mintAddress?: string,
): { balance: BN; loading: boolean; error?: Error } {
  const { data, isLoading, error } = useAtomValue(walletBalancesAtomFamily(walletAddress))
  return useMemo(() => {
    if (!mintAddress) return { balance: BIG_ZERO, loading: false }
    if (error) return { balance: BIG_ZERO, loading: false, error }
    if (isLoading || !data) return { balance: BIG_ZERO, loading: true }
    const stringAmount = data.get(mintAddress)?.[0]?.amount.toString()
    return { balance: stringAmount ? new BN(stringAmount) : BIG_ZERO, loading: false }
  }, [mintAddress, data, isLoading, error])
}

/**
 * Hook: get balances for a set of tokens for a wallet.
 * Reuses the walletBalancesAtomFamily cache.
 */
export function useSolanaTokenBalances(
  walletAddress?: string | null,
  mintAddresses?: string[],
): { balances: Map<string, BN>; loading: boolean } {
  const balancesAtom = useMemo(() => walletBalancesAtomFamily(walletAddress ?? null), [walletAddress])
  const { data, isLoading, error } = useAtomValue(balancesAtom)
  return useMemo(() => {
    if (error) return { balances: new Map<string, BN>(), loading: false, error }
    if (isLoading || !data) return { balances: new Map<string, BN>(), loading: true }
    // If mintAddresses is provided, filter the map; otherwise, return all
    const filtered = new Map<string, BN>()
    if (mintAddresses && mintAddresses.length > 0) {
      mintAddresses.forEach((mint) => {
        filtered.set(mint, new BN(data.get(mint)?.[0].amount.toString() ?? 0))
      })
    } else {
      data.forEach((_, key) => {
        filtered.set(key, new BN(data.get(key)?.[0].amount.toString() ?? 0))
      })
    }
    return { balances: filtered, loading: false }
  }, [mintAddresses, data, isLoading, error])
}

/**
 * Hook to trigger a manual refresh of Solana token balances.
 */
export function useRefreshSolanaTokenBalances(walletAddress?: string | null) {
  const queryClient = useQueryClient()
  return useCallback(() => {
    queryClient.invalidateQueries({ queryKey: [SOLANA_BALANCES_QUERY_KEY, walletAddress], exact: false })
  }, [queryClient, walletAddress])
}
