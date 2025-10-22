import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  TickUtils,
  PositionInfoLayout,
  PositionUtils,
  TickArrayLayout,
  ApiV3PoolInfoConcentratedItem,
  U64_IGNORE_RANGE,
  ApiV3Token,
  ZERO,
  DecreaseLiquidityEventLayout
} from '@pancakeswap/solana-core-sdk'
import { AccountInfo, Transaction } from '@solana/web3.js'
import BN from 'bn.js'
import Decimal from 'decimal.js'
import { shallow } from 'zustand/shallow'
import useSWR from 'swr'
import useTokenPrice from '@/hooks/token/useTokenPrice'
import useFetchMultipleAccountInfo from '@/hooks/info/useFetchMultipleAccountInfo'
import { getTickArrayAddress } from '@/hooks/pool/formatter'
import { getPoolName } from '@/features/Pools/util'
import { MINUTE_MILLISECONDS } from '@/utils/date'
import { addAccChangeCbk, removeAccChangeCbk } from '@/hooks/app/useTokenAccountInfo'
import { useAppStore, useClmmStore } from '@/store'
import useSubscribeClmmInfo, { RpcPoolData } from './useSubscribeClmmInfo'

interface Props {
  shouldFetch?: boolean
  poolInfo?: ApiV3PoolInfoConcentratedItem
  position: ReturnType<typeof PositionInfoLayout.decode> & { slot?: number; tickSlot?: number }
  initRpcPoolData?: RpcPoolData
  subscribe?: boolean
  tickLowerPrefetchData?: AccountInfo<Buffer> | null
  tickUpperPrefetchData?: AccountInfo<Buffer> | null
  inRange?: boolean
}

export type BreakdownRewardInfo = {
  fee: {
    A?: { amount: string; amountUSD: string; mint: ApiV3Token }
    B?: { amount: string; amountUSD: string; mint: ApiV3Token }
  }
  rewards: { mint: ApiV3Token; amount: string; amountUSD: string }[]
}

export default function useFetchClmmRewardInfo({
  poolInfo,
  position,
  initRpcPoolData,
  tickLowerPrefetchData,
  tickUpperPrefetchData,
  subscribe = true,
  shouldFetch = true
}: Props) {
  const { data: tokenPrices } = useTokenPrice({
    mintList: [poolInfo?.mintA.address, poolInfo?.mintB.address, ...(poolInfo?.rewardDefaultInfos.map((r) => r.mint.address) || [])]
  })

  const [tokenFees, setTokenFees] = useState<{ tokenFeeAmountA?: BN; tokenFeeAmountB?: BN }>({})
  const [rewards, setRewards] = useState<BN[]>([])
  const [isEmptyReward, setIsEmptyReward] = useState(false)
  const [totalPendingYield, setTotalPendingYield] = useState<Decimal>(new Decimal(0))

  // use subscribe to reduce rpc call
  const subscribeRpcData = useSubscribeClmmInfo({ subscribe, poolInfo, throttle: MINUTE_MILLISECONDS })
  const rpcPoolData = subscribeRpcData?.poolInfo || initRpcPoolData?.poolInfo
  const data = useFetchMultipleAccountInfo({
    name: poolInfo ? `${getPoolName(poolInfo)} position tick` : 'clmm position tick',
    publicKeyList:
      shouldFetch && poolInfo
        ? [
            getTickArrayAddress({ pool: poolInfo, tickNumber: position.tickLower }),
            getTickArrayAddress({ pool: poolInfo, tickNumber: position.tickUpper })
          ]
        : [],
    refreshInterval: 60 * 1000 * 10
  })

  const [tickLowerData, tickUpperData] = [tickLowerPrefetchData || data?.data?.value[0], tickUpperPrefetchData || data?.data?.value[1]]

  useEffect(() => {
    if (!tickLowerData || !tickUpperData || !rpcPoolData || !poolInfo || (position.tickSlot || 0) < (position.slot || 0)) return
    const tickArrayLower = TickArrayLayout.decode(tickLowerData.data)
    const tickArrayUpper = TickArrayLayout.decode(tickUpperData.data)
    const tickLowerState = tickArrayLower.ticks[TickUtils.getTickOffsetInArray(position.tickLower, rpcPoolData.tickSpacing)]
    const tickUpperState = tickArrayUpper.ticks[TickUtils.getTickOffsetInArray(position.tickUpper, rpcPoolData.tickSpacing)]
    const tokenFees = PositionUtils.GetPositionFeesV2(rpcPoolData, position, tickLowerState, tickUpperState)
    const rewards = PositionUtils.GetPositionRewardsV2(rpcPoolData, position, tickLowerState, tickUpperState)

    const BN_ZERO = new BN(0)
    const [tokenFeeAmountA, tokenFeeAmountB] = [
      tokenFees.tokenFeeAmountA.gte(BN_ZERO) && tokenFees.tokenFeeAmountA.lt(U64_IGNORE_RANGE) ? tokenFees.tokenFeeAmountA : BN_ZERO,
      tokenFees.tokenFeeAmountB.gte(BN_ZERO) && tokenFees.tokenFeeAmountB.lt(U64_IGNORE_RANGE) ? tokenFees.tokenFeeAmountB : BN_ZERO
    ]

    const rewardInfos = rewards.map((r) => (r.gte(BN_ZERO) && r.lt(U64_IGNORE_RANGE) ? r : BN_ZERO))

    setTokenFees({ tokenFeeAmountA, tokenFeeAmountB })
    setRewards(rewardInfos)

    const totalRewards = rewardInfos
      .map((r, idx) => {
        const rewardMint = poolInfo.rewardDefaultInfos.find(
          (r) => r.mint.address === rpcPoolData.rewardInfos[idx].tokenMint.toBase58()
        )?.mint
        if (!rewardMint) return '0'
        return new Decimal(r.toString())
          .div(10 ** (rewardMint.decimals || 0))
          .mul(tokenPrices[rewardMint.address]?.value || 0)
          .toString()
      })
      .reduce((acc, cur) => acc.add(cur), new Decimal(0))

    const totalPendingYield = new Decimal(tokenFeeAmountA.toString())
      .div(10 ** poolInfo.mintA.decimals)
      .mul(tokenPrices[poolInfo.mintA.address]?.value || 0)
      .add(new Decimal(tokenFeeAmountB.toString()).div(10 ** poolInfo.mintB.decimals).mul(tokenPrices[poolInfo.mintB.address]?.value || 0))
      .add(totalRewards)
    setTotalPendingYield(totalPendingYield)

    setIsEmptyReward(rewardInfos.filter((r) => r.gt(BN_ZERO)).length <= 0 && !tokenFeeAmountA.gt(BN_ZERO) && !tokenFeeAmountB.gt(BN_ZERO))
  }, [tickLowerData, tickUpperData, rpcPoolData, tokenPrices, position.tickSlot])

  useEffect(() => {
    addAccChangeCbk(data.mutate)
    return () => removeAccChangeCbk(data.mutate)
  }, [data.mutate])

  const allRewardInfos = useMemo(() => {
    if (!poolInfo || !rpcPoolData) return []
    const rewardToken = rewards
      .map((r, idx) => {
        const rewardMint = poolInfo.rewardDefaultInfos.find(
          (r) => r.mint.address === rpcPoolData.rewardInfos[idx].tokenMint.toBase58()
        )?.mint
        // const rewardMint = poolInfo.rewardDefaultInfos[idx]?.mint
        const amount = new Decimal(r?.toString() || 0).div(10 ** (rewardMint?.decimals ?? 0))
        return {
          mint: rewardMint,
          amount: rewardMint ? amount.toFixed(rewardMint?.decimals ?? 6) : '0',
          amountUSD: rewardMint ? amount.mul(tokenPrices[rewardMint?.address || '']?.value ?? 0).toFixed(4) : '0'
        }
      })
      .filter((r) => !!r.mint) as {
      mint: ApiV3Token
      amount: string
      amountUSD: string
    }[]

    const [feeAmountA, feeAmountB] = [
      new Decimal(tokenFees.tokenFeeAmountA?.toString() || 0).div(10 ** poolInfo.mintA.decimals),
      new Decimal(tokenFees.tokenFeeAmountB?.toString() || 0).div(10 ** poolInfo.mintB.decimals)
    ]

    const feeIndexA = rewardToken.findIndex((r) => r.mint.address === poolInfo.mintA.address)
    const usdValueA = feeAmountA.mul(tokenPrices[poolInfo.mintA.address]?.value ?? 0).toFixed(4)
    if (feeIndexA > -1) {
      rewardToken[feeIndexA].amount = new Decimal(rewardToken[feeIndexA].amount)
        .add(feeAmountA.toFixed(poolInfo.mintA.decimals))
        .toFixed(poolInfo.mintA.decimals)
      rewardToken[feeIndexA].amountUSD = new Decimal(rewardToken[feeIndexA].amountUSD).add(usdValueA).toFixed(4)
    } else {
      rewardToken.push({
        mint: poolInfo.mintA,
        amount: feeAmountA.toFixed(poolInfo.mintA.decimals),
        amountUSD: usdValueA
      })
    }

    const feeIndexB = rewardToken.findIndex((r) => r.mint.address === poolInfo.mintB.address)
    const usdValueB = feeAmountB.mul(tokenPrices[poolInfo.mintB.address]?.value ?? 0).toFixed(4)
    if (feeIndexB > -1) {
      rewardToken[feeIndexB].amount = new Decimal(rewardToken[feeIndexB].amount)
        .add(feeAmountB.toFixed(poolInfo.mintB.decimals))
        .toFixed(poolInfo.mintB.decimals)
      rewardToken[feeIndexB].amountUSD = new Decimal(rewardToken[feeIndexB].amountUSD).add(usdValueB).toFixed(4)
    } else {
      rewardToken.push({
        mint: poolInfo.mintB,
        amount: feeAmountB.toFixed(poolInfo.mintB.decimals),
        amountUSD: usdValueB
      })
    }
    return rewardToken
  }, [tokenFees, rewards, tokenPrices, poolInfo?.id])

  return {
    isEmptyReward,
    ...tokenFees,
    rewards,
    totalPendingYield,
    allRewardInfos
  }
}

export function useClmmRewardInfoFromSimulation(props: Props) {
  const {
    poolInfo,
    position,
    initRpcPoolData,
    shouldFetch: propsShouldFetch,
    tickLowerPrefetchData,
    tickUpperPrefetchData,
    inRange = true
  } = props
  const rpcPoolData =
    useSubscribeClmmInfo({ subscribe: false, poolInfo, throttle: MINUTE_MILLISECONDS, initialFetch: false })?.poolInfo ||
    initRpcPoolData?.poolInfo
  const { data: tokenPrices } = useTokenPrice({
    mintList: [poolInfo?.mintA.address, poolInfo?.mintB.address, ...(poolInfo?.rewardDefaultInfos.map((r) => r.mint.address) || [])]
  })
  const removeLiquidityActThrottle = useClmmStore((s) => s.removeLiquidityActThrottle)
  const raydium = useAppStore((s) => s.raydium)

  const simulation = useCallback(async () => {
    const simulationResult = (await removeLiquidityActThrottle({
      simulateOnly: true,
      poolInfo: poolInfo as ApiV3PoolInfoConcentratedItem,
      position,
      liquidity: ZERO,
      amountMinA: ZERO,
      amountMinB: ZERO,
      harvest: true
    })) as ReturnType<typeof DecreaseLiquidityEventLayout.decode>

    return simulationResult
  }, [poolInfo, position, removeLiquidityActThrottle])

  const shouldFetch = Boolean(propsShouldFetch && raydium && poolInfo && position)

  const { data, error, mutate, isLoading } = useSWR(
    shouldFetch ? `clmm-reward-info-${poolInfo?.id}-${position.nftMint.toBase58()}` : null,
    () => simulation(),
    inRange
      ? {
          revalidateOnFocus: true,
          revalidateOnReconnect: true,
          refreshInterval: 60 * 1000 * 1, // 1 minute
          keepPreviousData: true
        }
      : {
          revalidateOnFocus: false,
          revalidateOnReconnect: false,
          refreshInterval: 0,
          keepPreviousData: true
        }
  )

  const rewardsSimulateQueue = useClmmStore((s) => s.rewardsSimulateQueue)
  useEffect(() => {
    return () => {
      rewardsSimulateQueue.clear()
    }
  }, [rewardsSimulateQueue])

  const tokenFees = data
    ? {
        tokenFeeAmountA: data?.feeAmount0,
        tokenFeeAmountB: data?.feeAmount1
      }
    : {}

  const rewards = data?.rewardAmounts ?? []

  const totalRewards = useMemo(() => {
    if (!poolInfo || !rpcPoolData) return new Decimal(0)
    return rewards
      .map((r, idx) => {
        const rewardMint = poolInfo.rewardDefaultInfos[idx]?.mint
        if (!rewardMint) return '0'
        return new Decimal(r.toString())
          .div(10 ** (rewardMint.decimals || 0))
          .mul(tokenPrices[rewardMint.address]?.value || 0)
          .toString()
      })
      .reduce((acc, cur) => acc.add(cur), new Decimal(0))
  }, [poolInfo, rpcPoolData, rewards, tokenPrices])

  const totalPendingYield = useMemo(() => {
    if (!poolInfo || !tokenPrices) return new Decimal(0)
    return new Decimal(tokenFees.tokenFeeAmountA?.toString() || 0)
      .div(10 ** poolInfo.mintA.decimals)
      .mul(tokenPrices[poolInfo.mintA.address]?.value || 0)
      .add(
        new Decimal(tokenFees.tokenFeeAmountB?.toString() || 0)
          .div(10 ** poolInfo.mintB.decimals)
          .mul(tokenPrices[poolInfo.mintB.address]?.value || 0)
      )
      .add(totalRewards)
  }, [poolInfo, tokenPrices, totalRewards])

  const isEmptyReward = useMemo(() => {
    // loading
    if (!rewards || !tokenFees || !tokenFees.tokenFeeAmountA || !tokenFees.tokenFeeAmountB) return false

    return (
      rewards.filter((r) => r.gt(new BN(0))).length <= 0 &&
      !tokenFees.tokenFeeAmountA?.gt(new BN(0)) &&
      !tokenFees.tokenFeeAmountB?.gt(new BN(0))
    )
  }, [rewards, tokenFees])

  const allRewardInfos = useMemo(() => {
    if (!poolInfo || !rpcPoolData || !rewards || !rewards.length || !tokenPrices) return []

    const rewardToken = rewards
      .map((r, idx) => {
        const rewardMint = poolInfo.rewardDefaultInfos[idx]?.mint
        const amount = new Decimal(r?.toString() || 0).div(10 ** (rewardMint?.decimals ?? 0))
        return {
          mint: rewardMint,
          amount: rewardMint ? amount.toFixed(rewardMint?.decimals ?? 6) : '0',
          amountUSD: rewardMint ? amount.mul(tokenPrices[rewardMint?.address || '']?.value ?? 0).toFixed(4) : '0'
        }
      })
      .filter((r) => !!r.mint) as {
      mint: ApiV3Token
      amount: string
      amountUSD: string
    }[]

    const [feeAmountA, feeAmountB] = [
      new Decimal(tokenFees.tokenFeeAmountA?.toString() || 0).div(10 ** poolInfo.mintA.decimals),
      new Decimal(tokenFees.tokenFeeAmountB?.toString() || 0).div(10 ** poolInfo.mintB.decimals)
    ]

    const feeIndexA = rewardToken.findIndex((r) => r.mint.address === poolInfo.mintA.address)
    const usdValueA = feeAmountA.mul(tokenPrices[poolInfo.mintA.address]?.value ?? 0).toFixed(4)
    if (feeIndexA > -1) {
      rewardToken[feeIndexA].amount = new Decimal(rewardToken[feeIndexA].amount)
        .add(feeAmountA.toFixed(poolInfo.mintA.decimals))
        .toFixed(poolInfo.mintA.decimals)
      rewardToken[feeIndexA].amountUSD = new Decimal(rewardToken[feeIndexA].amountUSD).add(usdValueA).toFixed(4)
    } else {
      rewardToken.push({
        mint: poolInfo.mintA,
        amount: feeAmountA.toFixed(poolInfo.mintA.decimals),
        amountUSD: usdValueA
      })
    }

    const feeIndexB = rewardToken.findIndex((r) => r.mint.address === poolInfo.mintB.address)
    const usdValueB = feeAmountB.mul(tokenPrices[poolInfo.mintB.address]?.value ?? 0).toFixed(4)
    if (feeIndexB > -1) {
      rewardToken[feeIndexB].amount = new Decimal(rewardToken[feeIndexB].amount)
        .add(feeAmountB.toFixed(poolInfo.mintB.decimals))
        .toFixed(poolInfo.mintB.decimals)
      rewardToken[feeIndexB].amountUSD = new Decimal(rewardToken[feeIndexB].amountUSD).add(usdValueB).toFixed(4)
    } else {
      rewardToken.push({
        mint: poolInfo.mintB,
        amount: feeAmountB.toFixed(poolInfo.mintB.decimals),
        amountUSD: usdValueB
      })
    }
    // logMessage('rewardToken', rewardToken)
    return rewardToken
  }, [tokenFees, rewards, tokenPrices, poolInfo?.id])

  useEffect(() => {
    addAccChangeCbk(mutate)
    return () => removeAccChangeCbk(mutate)
  }, [mutate])

  const breakdownRewardInfo = useMemo(() => {
    if (!poolInfo || !tokenPrices)
      return {
        fee: {
          A: undefined,
          B: undefined
        },
        rewards: []
      } as BreakdownRewardInfo
    return {
      fee: {
        A: {
          mint: poolInfo.mintA,
          amount: tokenFees.tokenFeeAmountA?.div(new BN(10 ** poolInfo.mintA.decimals)).toString() || '0',
          amountUSD: new Decimal(tokenFees.tokenFeeAmountA?.toString() || 0)
            .div(10 ** poolInfo.mintA.decimals)
            .mul(tokenPrices[poolInfo.mintA.address]?.value || 0)
            .toFixed(4)
        },
        B: {
          mint: poolInfo.mintB,
          amount: tokenFees.tokenFeeAmountB?.div(new BN(10 ** poolInfo.mintB.decimals)).toString() || '0',
          amountUSD: new Decimal(tokenFees.tokenFeeAmountB?.toString() || 0)
            .div(10 ** poolInfo.mintB.decimals)
            .mul(tokenPrices[poolInfo.mintB.address]?.value || 0)
            .toFixed(4)
        }
      },
      rewards: rewards
        .map((r, idx) => {
          const rewardMint = poolInfo.rewardDefaultInfos[idx]?.mint
          if (!rewardMint) return { mint: null, amount: '0', amountUSD: '0' }
          const amount = new Decimal(r.toString()).div(10 ** (rewardMint.decimals || 0))
          return {
            mint: rewardMint,
            amount: amount.toFixed(rewardMint.decimals || 6),
            amountUSD: amount.mul(tokenPrices[rewardMint.address]?.value || 0).toFixed(4)
          }
        })
        .filter((r) => !!r.mint)
    }
  }, [rewards, tokenFees])

  return {
    isEmptyReward,
    ...tokenFees,
    breakdownRewardInfo,
    rewards,
    isLoading,
    totalPendingYield,
    allRewardInfos
  }
}
