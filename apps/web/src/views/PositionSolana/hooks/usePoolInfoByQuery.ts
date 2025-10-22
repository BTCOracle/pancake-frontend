import { TokenInfo } from '@pancakeswap/solana-core-sdk'
import { convertRawTokenInfoIntoSPLToken } from 'config/solana-list'
import { useSolanaV3PositionIdRouteParams } from 'hooks/dynamicRoute/usePositionIdRoute'
import { useSolanaV3Pool } from 'hooks/solana/useSolanaV3Pools'
import { useMemo } from 'react'
import { SolanaV3PoolInfo } from 'state/farmsV4/state/type'
import { SolanaV3Pool } from 'state/pools/solana'
import { ZERO_ADDRESS } from '@pancakeswap/swap-sdk-core'
import { Protocol } from '@pancakeswap/farms'
import { NonEVMChainId } from '@pancakeswap/chains'
import { useSolanaV3PoolsUpdater } from 'hooks/solana/useSolanaV3PoolsUpdater'
import { POSITION_STATUS } from 'state/farmsV4/state/accountPositions/type'
import { useSolanaV3Position } from './useSolanaV3Position'

export const usePoolInfoByQuery = (): SolanaV3PoolInfo | undefined | null => {
  const { poolId, mintId } = useSolanaV3PositionIdRouteParams()
  const poolInfo = useSolanaV3Pool(poolId)
  const position = useSolanaV3Position(mintId)
  const currency0 = useMemo(
    () => (poolInfo?.mintA ? convertRawTokenInfoIntoSPLToken(poolInfo.mintA as TokenInfo) : undefined),
    [poolInfo?.mintA],
  )
  const currency1 = useMemo(
    () => (poolInfo?.mintB ? convertRawTokenInfoIntoSPLToken(poolInfo.mintB as TokenInfo) : undefined),
    [poolInfo?.mintB],
  )

  useSolanaV3PoolsUpdater(useMemo(() => (poolInfo ? [poolInfo] : undefined), [poolInfo]))

  return useMemo(() => {
    if (!currency0 || !currency1 || !poolInfo || !position) {
      return undefined
    }
    return {
      pid: 0,
      nftMint: position.nftMint,
      lpAddress: ZERO_ADDRESS,
      protocol: Protocol.V3,
      token0: currency0,
      token1: currency1,
      feeTier: poolInfo.feeRate,
      feeTierBase: 1,
      isFarming:
        !position.liquidity.isZero() && position.status !== POSITION_STATUS.INACTIVE && Boolean(poolInfo.isFarming),
      poolId: position.poolId.toBase58(),
      liquidity: BigInt(position.liquidity.toString()),
      chainId: NonEVMChainId.SOLANA,
      tvlUsd: poolInfo.tvl.toString() as `${number}`,
      rawPool: poolInfo,
    } satisfies SolanaV3PoolInfo
  }, [currency0, currency1, poolInfo, position])
}
