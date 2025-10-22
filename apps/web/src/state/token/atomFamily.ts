import { TokenAccount } from '@pancakeswap/solana-core-sdk'
import { rpcUrlAtom } from '@pancakeswap/utils/user'
import { atom } from 'jotai'
import { atomWithQuery } from 'jotai-tanstack-query'
import { atomFamily } from 'jotai/utils'
import { FAST_INTERVAL } from 'config/constants'
import { fetchSolanaTokenBalances } from './solanaBalanceFetcher'

// Refresh counter per wallet address for triggering balance updates
export const solanaWalletBalanceRefreshCounterAtomFamily = atomFamily(() => atom(0))

export const SOLANA_BALANCES_QUERY_KEY = 'solanaTokenBalances'

export const walletBalancesAtomFamily = atomFamily((walletAddress: string | null | undefined) =>
  atomWithQuery<Map<string, TokenAccount[]>, Error>((get) => {
    const rpc = get(rpcUrlAtom)
    return {
      queryKey: [SOLANA_BALANCES_QUERY_KEY, walletAddress, rpc],
      enabled: Boolean(walletAddress),
      queryFn: () => fetchSolanaTokenBalances(walletAddress!, rpc),
      refetchInterval: FAST_INTERVAL,
      initialData: () => new Map<string, TokenAccount[]>(),
    }
  }),
)
