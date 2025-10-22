import type { ApiV3PoolInfoConcentratedItem } from '@pancakeswap/solana-core-sdk'
import { PoolUtils } from '@pancakeswap/solana-core-sdk'
import BN from 'bn.js'
import { useMemo } from 'react'

export enum AprKey {
  Day = 'day',
  Week = 'week',
  Month = 'month',
}

export type TokenPrice = { value: number }

export interface AprBreakdown {
  fee: {
    apr: number
    percentInTotal: number
  }
  rewards: {
    apr: number
    percentInTotal: number
    // keep shape compatible with solana-core-sdk reward mint if needed by callers
    mint?: unknown
  }[]
  apr: number
}

type GetAprForRangeParams = {
  poolInfo: ApiV3PoolInfoConcentratedItem
  poolLiquidity: BN
  tickLower: number
  tickUpper: number
  planType: 'D' | 'M'
  tokenPrices: Record<string, TokenPrice>
  timeBasis: AprKey
  chainTimeOffsetMs?: number
  liquidity: BN
}

export function getAprForPriceRange({
  poolInfo,
  poolLiquidity,
  tickLower,
  tickUpper,
  planType,
  tokenPrices,
  timeBasis,
  chainTimeOffsetMs = 0,
  liquidity,
}: GetAprForRangeParams): AprBreakdown {
  if (liquidity.isZero()) {
    return {
      fee: { apr: 0, percentInTotal: 0 },
      rewards: (poolInfo.rewardDefaultInfos || []).map((_, idx) => ({
        apr: 0,
        percentInTotal: 0,
        mint: poolInfo.rewardDefaultInfos?.[idx]?.mint,
      })),
      apr: 0,
    }
  }

  if (planType === 'D') {
    const planBApr = PoolUtils.estimateAprsForPriceRangeDelta({
      poolInfo,
      poolLiquidity,
      aprType: timeBasis,
      mintPrice: tokenPrices,
      positionTickLowerIndex: Math.min(tickLower, tickUpper),
      positionTickUpperIndex: Math.max(tickLower, tickUpper),
      chainTime: (Date.now() + chainTimeOffsetMs) / 1000,
      liquidity,
    })
    const slicedRewardApr = (planBApr.rewardsApr || []).slice(0, poolInfo.rewardDefaultInfos?.length || 0)
    const total = [planBApr.feeApr, ...slicedRewardApr].reduce((a, b) => a + b, 0)
    return {
      fee: { apr: planBApr.feeApr, percentInTotal: total ? (planBApr.feeApr / total) * 100 : 0 },
      rewards: slicedRewardApr.map((i, idx) => ({
        apr: i,
        percentInTotal: total ? (i / total) * 100 : 0,
        mint: poolInfo.rewardDefaultInfos?.[idx]?.mint,
      })),
      apr: Number.isNaN(planBApr.apr) ? 0 : planBApr.apr,
    }
  }

  const planCApr = PoolUtils.estimateAprsForPriceRangeMultiplier({
    poolInfo,
    aprType: timeBasis,
    positionTickLowerIndex: Math.min(tickLower, tickUpper),
    positionTickUpperIndex: Math.max(tickLower, tickUpper),
  })
  const slicedRewardApr = (planCApr.rewardsApr || []).slice(0, poolInfo.rewardDefaultInfos?.length || 0)
  const total = [planCApr.feeApr, ...slicedRewardApr].reduce((a, b) => a + b, 0)
  return {
    fee: { apr: planCApr.feeApr, percentInTotal: total ? (planCApr.feeApr / total) * 100 : 0 },
    rewards: slicedRewardApr.map((i, idx) => ({
      apr: i,
      percentInTotal: total ? (i / total) * 100 : 0,
      mint: poolInfo.rewardDefaultInfos?.[idx]?.mint,
    })),
    apr: Number.isNaN(planCApr.apr) ? 0 : planCApr.apr,
  }
}

export const useClmmApr = ({
  poolInfo,
  poolLiquidity,
  positionInfo,
  timeBasis,
  planType = 'M',
  chainTimeOffsetMs = 0,
  tokenPrices = {},
}: {
  poolInfo?: ApiV3PoolInfoConcentratedItem
  poolLiquidity: BN
  positionInfo: { tickLower?: number; tickUpper?: number; liquidity?: BN }
  timeBasis: AprKey
  planType?: 'D' | 'M'
  chainTimeOffsetMs?: number
  tokenPrices?: Record<string, TokenPrice>
}) => {
  const tickLower = positionInfo?.tickLower ?? 0
  const tickUpper = positionInfo?.tickUpper ?? 0

  const apr = useMemo<AprBreakdown | undefined>(() => {
    if (!poolInfo) return undefined
    if (tickLower == null || tickUpper == null) return undefined
    try {
      return getAprForPriceRange({
        poolInfo,
        poolLiquidity,
        tickLower,
        tickUpper,
        planType,
        tokenPrices,
        timeBasis,
        chainTimeOffsetMs,
        // For multiplier-based plan, liquidity isn't required; use 1 as nominal liquidity when missing
        liquidity: positionInfo.liquidity ?? new BN(1),
      })
    } catch (e) {
      return undefined
    }
  }, [
    poolInfo,
    positionInfo?.liquidity,
    tickLower,
    tickUpper,
    planType,
    tokenPrices,
    timeBasis,
    chainTimeOffsetMs,
    poolLiquidity,
  ])

  return apr
}
