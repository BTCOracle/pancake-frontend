import { NonEVMChainId } from '@pancakeswap/chains'
import { Protocol } from '@pancakeswap/farms'
import { ApiV3PoolInfoConcentratedItem, wSolToSolToken } from '@pancakeswap/solana-core-sdk'
import { SPLToken } from '@pancakeswap/swap-sdk-core'
import { PublicKey } from '@solana/web3.js'
import type { SolanaV3PoolInfo } from 'state/farmsV4/state/type'
import { SolanaV3Pool } from 'state/pools/solana'

export const normalizeSolanaPoolInfo = (
  solanaPoolInfo?: Omit<ApiV3PoolInfoConcentratedItem, 'type'> & {
    type: string
    volumeUSD48h?: string
    volumeUSD24h?: string
    tvlUSD24h?: string
    tvlUSD?: string
  },
): SolanaV3PoolInfo | null => {
  if (!solanaPoolInfo) return null
  const token0 = new SPLToken({ ...wSolToSolToken(solanaPoolInfo.mintA), chainId: NonEVMChainId.SOLANA })
  const token1 = new SPLToken({ ...wSolToSolToken(solanaPoolInfo.mintB), chainId: NonEVMChainId.SOLANA })

  return {
    chainId: NonEVMChainId.SOLANA,
    lpAddress: solanaPoolInfo.id,
    poolId: solanaPoolInfo.id,
    protocol: Protocol.V3 as const,
    token0,
    token1,
    token0Price: String(solanaPoolInfo.price) as `${number}`,
    token1Price: (solanaPoolInfo.price ? String(1 / solanaPoolInfo.price) : '0') as `${number}`,
    tvlToken0: String(solanaPoolInfo.mintAmountA) as `${number}`,
    tvlToken1: String(solanaPoolInfo.mintAmountB) as `${number}`,
    tvlUsd: String(solanaPoolInfo.tvlUSD) as `${number}`,
    tvlUsd24h: String(solanaPoolInfo.tvlUSD24h ?? 0) as `${number}`,
    vol24hUsd: String(solanaPoolInfo.volumeUSD24h ?? 0) as `${number}`,
    vol48hUsd: String(solanaPoolInfo.volumeUSD48h ?? 0) as `${number}`, // Approximate
    vol7dUsd: String(solanaPoolInfo.week.volume) as `${number}`,
    fee24hUsd: String(solanaPoolInfo.day.volumeFee) as `${number}`,
    lpFee24hUsd: String(solanaPoolInfo.day.volumeFee) as `${number}`,
    lpApr: String(solanaPoolInfo.day.apr) as `${number}`,
    feeTier: Math.round(solanaPoolInfo.feeRate * 1e6), // Convert to basis points
    feeTierBase: 1e6, // Base for percentage calculations
    isFarming: false,
    isDynamicFee: false,
    rawPool: solanaPoolInfo as SolanaV3Pool,
    nftMint: PublicKey.default,
  }
}
