import { TokenInfo } from '@pancakeswap/solana-core-sdk'
import { useCallback, useMemo } from 'react'
import { useSolanaConnectionWithRpcAtom } from 'hooks/solana/useSolanaConnectionWithRpcAtom'
import { SolanaV3PositionDetail } from 'state/farmsV4/state/accountPositions/type'
import { SolanaV3PoolInfo } from 'state/farmsV4/state/type'
import { removeLiquidity } from 'state/pools/solana/actions'
import { useQuery } from '@tanstack/react-query'
import { QUERY_SETTINGS_IMMUTABLE } from 'config/constants'
import { useSolanaTokenPrices } from 'hooks/solana/useSolanaTokenPrice'
import { useLatestTxReceipt } from 'state/farmsV4/state/accountPositions/hooks/useLatestTxReceipt'
import BigNumber from 'bignumber.js'
import PQueue from 'p-queue'
import { useRaydium } from 'hooks/solana/useRaydium'
import uniq from 'lodash/uniq'

const simulationQueue = new PQueue({
  interval: 1000,
  intervalCap: 1,
})

export type SolanaV3RewardInfoFromSimulationProps = {
  poolInfo: SolanaV3PoolInfo | undefined
  position: SolanaV3PositionDetail
}

export type BreakdownRewardInfo = {
  fee: {
    A?: { amount: string; amountUSD: string; mint: TokenInfo }
    B?: { amount: string; amountUSD: string; mint: TokenInfo }
  }
  rewards: { mint: TokenInfo; amount: string; amountUSD: string }[]
}

const DEFAULT_SIMULATION_RESULT = {
  feeAmount0: 0n,
  feeAmount1: 0n,
  rewardAmounts: [],
} as const

export const useSolanaV3RewardInfoFromSimulation = ({ poolInfo, position }: SolanaV3RewardInfoFromSimulationProps) => {
  const connection = useSolanaConnectionWithRpcAtom()
  const raydium = useRaydium()
  const simulation = useCallback(async () => {
    const result = await simulationQueue.add(async () => {
      if (!raydium || !poolInfo) return DEFAULT_SIMULATION_RESULT

      try {
        const simulationResult = await removeLiquidity({
          simulateOnly: true,
          poolInfo,
          raydium,
          position,
          liquidity: 0n,
          amountMinA: 0n,
          amountMinB: 0n,
          harvest: true,
        })
        return simulationResult || DEFAULT_SIMULATION_RESULT
      } catch (error) {
        console.error('simulation error', error)
        return DEFAULT_SIMULATION_RESULT
      }
    })
    return result
  }, [connection, poolInfo, position, raydium])
  const [latestTxReceipt] = useLatestTxReceipt()
  const { data } = useQuery({
    queryKey: [
      'solana-v3-reward-info-from-simulation',
      poolInfo?.poolId,
      position.nftMint.toBase58(),
      latestTxReceipt?.blockHash,
    ],
    queryFn: simulation,
    enabled: Boolean(poolInfo && position && raydium),
    ...QUERY_SETTINGS_IMMUTABLE,
  })

  const tokenFees = useMemo(
    () =>
      data
        ? {
            tokenFeeAmountA: data?.feeAmount0,
            tokenFeeAmountB: data?.feeAmount1,
          }
        : {},
    [data],
  )

  const rewards = useMemo(() => data?.rewardAmounts ?? [], [data])

  const mints = useMemo(() => {
    return uniq([
      poolInfo?.rawPool.mintA.address,
      poolInfo?.rawPool.mintB.address,
      ...(poolInfo?.rawPool?.rewardDefaultInfos?.map((r) => r.mint.address) || []),
    ])
  }, [poolInfo])

  const { data: tokenPrices } = useSolanaTokenPrices({
    mints,
    enabled: mints.length > 0,
  })

  const totalRewards = useMemo(() => {
    if (!poolInfo) return new BigNumber(0)
    return rewards
      .map((r, idx) => {
        const rewardMint = poolInfo.rawPool.rewardDefaultInfos[idx]?.mint
        if (!rewardMint) return '0'
        return new BigNumber(r.toString())
          .div(10 ** (rewardMint.decimals || 0))
          .multipliedBy(tokenPrices[rewardMint.address.toLowerCase()] || 0)
          .toString()
      })
      .reduce((acc, cur) => acc.plus(cur), new BigNumber(0))
  }, [poolInfo, rewards, tokenPrices])

  const totalPendingYield = useMemo(() => {
    if (!poolInfo || !tokenPrices) return new BigNumber(0)
    return new BigNumber(tokenFees.tokenFeeAmountA?.toString() || 0)
      .div(10 ** poolInfo.rawPool.mintA.decimals)
      .multipliedBy(tokenPrices[poolInfo.rawPool.mintA.address.toLowerCase()] || 0)
      .plus(
        new BigNumber(tokenFees.tokenFeeAmountB?.toString() || 0)
          .div(10 ** poolInfo.rawPool.mintB.decimals)
          .multipliedBy(tokenPrices[poolInfo.rawPool.mintB.address.toLowerCase()] || 0),
      )
      .plus(totalRewards)
  }, [poolInfo, tokenPrices, totalRewards, tokenFees.tokenFeeAmountA, tokenFees.tokenFeeAmountB])

  const breakdownRewardInfo = useMemo(() => {
    if (!poolInfo || !tokenPrices)
      return {
        fee: {
          A: undefined,
          B: undefined,
        },
        rewards: [],
      } as BreakdownRewardInfo
    return {
      fee: {
        A: {
          mint: poolInfo.rawPool.mintA,
          amount:
            new BigNumber(tokenFees.tokenFeeAmountA?.toString() ?? 0)
              .div(new BigNumber(10 ** poolInfo.rawPool.mintA.decimals))
              .toString() || '0',
          amountUSD: new BigNumber(tokenFees.tokenFeeAmountA?.toString() || 0)
            .div(10 ** poolInfo.rawPool.mintA.decimals)
            .multipliedBy(tokenPrices[poolInfo.rawPool.mintA.address.toLowerCase()] || 0)
            .toFixed(4),
        },
        B: {
          mint: poolInfo.rawPool.mintB,
          amount:
            new BigNumber(tokenFees.tokenFeeAmountB?.toString() ?? 0)
              .div(new BigNumber(10 ** poolInfo.rawPool.mintB.decimals))
              .toString() || '0',
          amountUSD: new BigNumber(tokenFees.tokenFeeAmountB?.toString() || 0)
            .div(10 ** poolInfo.rawPool.mintB.decimals)
            .multipliedBy(tokenPrices[poolInfo.rawPool.mintB.address.toLowerCase()] || 0)
            .toFixed(4),
        },
      },
      rewards: rewards
        .map((r, idx) => {
          const rewardMint = poolInfo.rawPool.rewardDefaultInfos[idx]?.mint
          if (!rewardMint) return { mint: null, amount: '0', amountUSD: '0' }
          const amount = new BigNumber(r.toString()).div(10 ** (rewardMint.decimals || 0))
          return {
            mint: rewardMint,
            amount: amount.toFixed(rewardMint.decimals || 6),
            amountUSD: amount.multipliedBy(tokenPrices[rewardMint.address.toLowerCase()] || 0).toFixed(4),
          }
        })
        .filter((r) => !!r.mint),
    }
  }, [rewards, tokenFees, poolInfo, tokenPrices])

  return {
    breakdownRewardInfo,
    totalPendingYield,
  }
}
