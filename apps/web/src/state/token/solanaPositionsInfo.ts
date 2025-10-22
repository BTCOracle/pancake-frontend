import { useAtomValue } from 'jotai'
import { useSolanaTokenList } from 'hooks/solana/useSolanaTokenList'
import { useMemo } from 'react'
import {
  getMultipleAccountsInfo,
  getPdaPersonalPositionAddress,
  PositionInfoLayout,
  TokenAccount,
} from '@pancakeswap/solana-core-sdk'
import BN from 'bn.js'
import { useQuery } from '@tanstack/react-query'
import { Connection, PublicKey } from '@solana/web3.js'
import { rpcUrlAtom } from '@pancakeswap/utils/user'
import memoize from '@pancakeswap/utils/memoize'
import { PANCAKE_CLMM_PROGRAM_ID, SLOW_INTERVAL } from 'config/constants'
import { useLatestTxReceipt } from 'state/farmsV4/state/accountPositions/hooks/useLatestTxReceipt'
import { walletBalancesAtomFamily } from './atomFamily'

export const useSolanaPositionNFTsByAccount = (walletAddress?: string | null) => {
  const { data, isLoading } = useAtomValue(walletBalancesAtomFamily(walletAddress))
  const { tokenList } = useSolanaTokenList()

  return useMemo(() => {
    if (isLoading || !data) return []

    const d = Array.from(data.values())
      .flat()
      .filter((token: TokenAccount) => {
        return token.amount.eq(new BN(1)) && !tokenList.some((t) => t.address === token.mint.toBase58())
      })

    return d
  }, [data, isLoading, tokenList])
}

const solanaPositionInfoFetcher = async (rpc: string, addresses: PublicKey[]) => {
  const connection = new Connection(rpc)

  try {
    const res = await getMultipleAccountsInfo(connection, addresses)

    return res
      .flat()
      .map((info) => {
        if (!info) return null
        return PositionInfoLayout.decode(info.data)
      })
      .filter((info) => !!info)
  } catch (error) {
    console.error('error fetching solana position info', error)
    return []
  }
}

const pdaCacheMap = new Map<string, PublicKey>()

const getSolanaPositionMints = memoize((nfts: TokenAccount[]) => {
  return nfts.map((nft) => {
    const key = `${nft.mint.toBase58()}-${nft.programId.toBase58()}`
    if (pdaCacheMap.get(key)) return pdaCacheMap.get(key)!
    const pda = getPdaPersonalPositionAddress(PANCAKE_CLMM_PROGRAM_ID, nft.mint)
    pdaCacheMap.set(key, pda.publicKey)
    return pda.publicKey
  })
})

export const SOLANA_POSITION_INFO_QUERY_KEY = 'solana-position-info'

export const useSolanaPositionsInfoByAccount = (walletAddress?: string | null) => {
  const nfts = useSolanaPositionNFTsByAccount(walletAddress)
  const rpc = useAtomValue(rpcUrlAtom)
  const [latestTxReceipt] = useLatestTxReceipt()

  return useQuery({
    queryKey: [SOLANA_POSITION_INFO_QUERY_KEY, walletAddress, latestTxReceipt?.blockHash],
    queryFn: () => solanaPositionInfoFetcher(rpc, getSolanaPositionMints(nfts)),
    enabled: Boolean(walletAddress) && nfts.length > 0,
    staleTime: 0,
    refetchInterval: SLOW_INTERVAL,
    refetchOnWindowFocus: true,
  })
}
