import { PoolUtils } from '@pancakeswap/solana-core-sdk'
import { SolanaV3PositionDetail } from 'state/farmsV4/state/accountPositions/type'
import { SolanaV3Pool } from 'state/pools/solana'
import BN from 'bn.js'

export type GetAprPositionParameters = {
  poolInfo: SolanaV3Pool
  positionAccount: SolanaV3PositionDetail
  mintPrices: Record<string, { value: number }> | undefined
  chainTimeOffsetMs?: number
  inRange?: boolean
}

export function getPositionAprCore({
  poolInfo,
  positionAccount,
  chainTimeOffsetMs = 0,
  inRange = true,
  mintPrices,
}: GetAprPositionParameters) {
  if (positionAccount.liquidity.isZero() || !mintPrices) {
    return {
      fee: {
        apr: 0,
        percentInTotal: 0,
      },
      rewards: poolInfo.rewardDefaultInfos.map((i, idx) => ({
        apr: 0,
        percentInTotal: 0,
        mint: poolInfo.rewardDefaultInfos[idx].mint,
      })),
      apr: 0,
    }
  }

  if (!inRange) {
    return {
      fee: {
        apr: 0,
        percentInTotal: 0,
      },
      rewards: poolInfo.rewardDefaultInfos.map((i, idx) => ({
        apr: 0,
        percentInTotal: 0,
        mint: poolInfo.rewardDefaultInfos[idx].mint,
      })),
      apr: 0,
    }
  }

  const planCApr = PoolUtils.estimateAprsForPriceRangeDelta({
    poolInfo,
    aprType: 'day',
    poolLiquidity: new BN(poolInfo.liquidity?.toString() || '0'),
    liquidity: positionAccount.liquidity,
    mintPrice: mintPrices,
    chainTime: (Date.now() + chainTimeOffsetMs) / 1000,
    positionTickLowerIndex: Math.min(positionAccount.tickLower, positionAccount.tickUpper),
    positionTickUpperIndex: Math.max(positionAccount.tickLower, positionAccount.tickUpper),
  })
  const slicedRewardApr = planCApr.rewardsApr.slice(0, poolInfo.rewardDefaultInfos.length)
  const total = [planCApr.feeApr, ...slicedRewardApr].reduce((a, b) => a + b, 0)
  return {
    fee: {
      apr: planCApr.feeApr / 100,
      percentInTotal: (planCApr.feeApr / total) * 100,
    },
    rewards: slicedRewardApr.map((i, idx) => ({
      apr: i / 100,
      percentInTotal: (i / total) * 100,
      mint: poolInfo.rewardDefaultInfos[idx].mint,
    })),
    apr: Number.isNaN(planCApr.apr) ? 0 : planCApr.apr / 100,
  }
}
