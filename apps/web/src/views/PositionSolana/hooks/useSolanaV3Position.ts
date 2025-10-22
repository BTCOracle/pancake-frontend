import { NonEVMChainId } from '@pancakeswap/chains'
import { Protocol } from '@pancakeswap/farms'
import { getPdaPersonalPositionAddress, PositionInfoLayout, TokenInfo } from '@pancakeswap/solana-core-sdk'
import { Connection, PublicKey } from '@solana/web3.js'
import { useQuery } from '@tanstack/react-query'
import { PANCAKE_CLMM_PROGRAM_ID, SLOW_INTERVAL } from 'config/constants'
import { convertRawTokenInfoIntoSPLToken } from 'config/solana-list'
import { useSolanaConnectionWithRpcAtom } from 'hooks/solana/useSolanaConnectionWithRpcAtom'
import { useSolanaV3Pool } from 'hooks/solana/useSolanaV3Pools'
import { useMemo } from 'react'
import { useLatestTxReceipt } from 'state/farmsV4/state/accountPositions/hooks/useLatestTxReceipt'
import { SolanaV3PositionDetail } from 'state/farmsV4/state/accountPositions/type'
import { getSolanaPoolStatus } from 'views/universalFarms/hooks/useSolanaV3Positions'

const getSolanaPositionInfo = async (connection: Connection, nftMintId: string) => {
  try {
    const account = getPdaPersonalPositionAddress(PANCAKE_CLMM_PROGRAM_ID, new PublicKey(nftMintId))
    const res = await connection.getAccountInfo(account.publicKey, { commitment: 'processed' })

    if (!res) return null

    return PositionInfoLayout.decode(res.data)
  } catch (error) {
    console.error('Error fetching Solana position info:', error)
    return null
  }
}

export const SOLANA_V3_POSITION_QUERY_KEY = 'solana-v3-position'
const useSolanaV3PositionOnChain = (nftMintId: string | undefined) => {
  const [latestTxReceipt] = useLatestTxReceipt()
  const connection = useSolanaConnectionWithRpcAtom()

  return useQuery({
    queryKey: [SOLANA_V3_POSITION_QUERY_KEY, nftMintId, latestTxReceipt?.blockHash],
    queryFn: () => getSolanaPositionInfo(connection, nftMintId!),
    enabled: !!nftMintId && !!connection,
    staleTime: 0,
    refetchInterval: SLOW_INTERVAL,
    refetchOnWindowFocus: true,
  })
}

export const useSolanaV3Position = (nftMintId: string | undefined): SolanaV3PositionDetail | null => {
  const { data: onChainPosition } = useSolanaV3PositionOnChain(nftMintId)
  const pool = useSolanaV3Pool(onChainPosition?.poolId.toBase58())

  const positionWithStatus = useMemo(() => {
    if (!onChainPosition || !pool) return null

    return {
      ...onChainPosition,
      status: getSolanaPoolStatus(onChainPosition, pool),
      protocol: Protocol.V3 as const,
      chainId: NonEVMChainId.SOLANA,
      token0: convertRawTokenInfoIntoSPLToken(pool.mintA as TokenInfo),
      token1: convertRawTokenInfoIntoSPLToken(pool.mintB as TokenInfo),
    }
  }, [onChainPosition, pool])

  return positionWithStatus
}
