import { ChainId } from '@pancakeswap/chains'
import { multicallByGasLimit } from '@pancakeswap/multicall'
import { BigintIsh } from '@pancakeswap/swap-sdk-core'
import { FeeAmount, Tick, TICK_SPACINGS } from '@pancakeswap/v3-sdk'
import { Address, decodeFunctionResult, encodeFunctionData } from 'viem'

import { infinityCLTickLensAbi } from '../abis/IInfinityCLTickLens'
import { tickLensAbi } from '../abis/ITickLens'
import { V3_TICK_LENS_ADDRESSES } from '../constants/v3'
import { INFI_CL_TICK_LENS_ADDRESSES } from '../constants/infinity'
import { getTickLensFetchConfig, getV3PoolFetchConfig } from '../infinity-router/constants/v3PoolFetchGasLimit'
import { InfinityClPool, OnChainProvider, PoolType, V3Pool } from '../v3-router/types'
import { formatGas } from './compactTickQuery.helper'

type WithMulticallGasLimit = {
  gasLimit?: BigintIsh
}

type WithClientProvider = {
  clientProvider?: OnChainProvider
}

type PoolWithTicks = V3Pool | InfinityClPool

const TICK_RANGE_BY_POOL_TYPE: Record<PoolType.V3 | PoolType.InfinityCL, number> = {
  [PoolType.V3]: 1000,
  [PoolType.InfinityCL]: 10,
}

function getPoolChainId(pool: PoolWithTicks): ChainId {
  if (pool.type === PoolType.V3) {
    return pool.token0.chainId as ChainId
  }
  return pool.currency0.chainId as ChainId
}

function getBitmapIndex(tick: number, tickSpacing: number) {
  return Math.floor(tick / tickSpacing / 256)
}

export function getBitmapTickRange(bitmapIndex: number, tickSpacing: number) {
  return {
    minTick: bitmapIndex * 256 * tickSpacing,
    maxTick: (bitmapIndex + 1) * 256 * tickSpacing - 1,
  }
}

type BuildBitmapIndexListParams = {
  currentTick: number
  tickSpacing: number
}

function createBitmapIndexListBuilder(tickRange: number) {
  return function buildBitmapIndexList<T>({ currentTick, tickSpacing, ...rest }: BuildBitmapIndexListParams & T) {
    const minIndex = getBitmapIndex(currentTick - tickRange, tickSpacing)
    const maxIndex = getBitmapIndex(currentTick + tickRange, tickSpacing)
    return Array.from({ length: maxIndex - minIndex + 1 }, (_, i) => ({
      bitmapIndex: minIndex + i,
      ...rest,
    }))
  }
}

const buildV3BitmapIndexList = createBitmapIndexListBuilder(TICK_RANGE_BY_POOL_TYPE[PoolType.V3])
const buildInfinityBitmapIndexList = createBitmapIndexListBuilder(TICK_RANGE_BY_POOL_TYPE[PoolType.InfinityCL])

function ensureSameChain(pools: PoolWithTicks[]): ChainId {
  const [first, ...rest] = pools
  const chainId = getPoolChainId(first)
  for (const pool of rest) {
    if (getPoolChainId(pool) !== chainId) {
      throw new Error('Cannot fetch ticks for pools across different chains in a single call')
    }
  }
  return chainId
}

function normalizePoolKey(pool: PoolWithTicks) {
  return pool.type === PoolType.V3 ? pool.address.toLowerCase() : pool.id.toLowerCase()
}

export type FetchTickLenPoolsTickParams = {
  pools: (V3Pool | InfinityClPool)[]
  disableFilterNoTicks?: boolean
} & WithClientProvider &
  WithMulticallGasLimit

const tickLensGasLimit = 10_000_000n

export async function fetchTickLenPoolsTick({
  pools,
  clientProvider,
  gasLimit,
  disableFilterNoTicks,
}: FetchTickLenPoolsTickParams): Promise<Record<string, Tick[]>> {
  if (!pools.length) {
    return {}
  }

  const chainId = ensureSameChain(pools)
  const client = clientProvider?.({ chainId })

  if (!client) {
    throw new Error('Fill pools with ticks failed. No valid public client found.')
  }

  const { gasLimit: gasLimitPerCall, retryGasMultiplier } = getTickLensFetchConfig()

  const ticksByPool: Record<string, Tick[]> = {}

  const v3Pools = pools.filter((pool): pool is V3Pool => pool.type === PoolType.V3)
  if (v3Pools.length) {
    const tickLensAddress = V3_TICK_LENS_ADDRESSES[chainId]
    if (!tickLensAddress) {
      throw new Error('Fill pools with ticks failed. No V3 tick lens found.')
    }

    const bitmapIndexes = v3Pools.flatMap((pool) =>
      buildV3BitmapIndexList({
        currentTick: pool.tick,
        tickSpacing: TICK_SPACINGS[Number(pool.fee) as FeeAmount],
        pool,
      }),
    )

    if (bitmapIndexes.length) {
      const res = await multicallByGasLimit(
        bitmapIndexes.map(({ pool, bitmapIndex }) => ({
          target: tickLensAddress as Address,
          callData: encodeFunctionData({
            abi: tickLensAbi,
            args: [pool.address, bitmapIndex],
            functionName: 'getPopulatedTicksInWord',
          }),
          gasLimit: gasLimitPerCall,
        })),
        {
          chainId,
          client,
          gasLimit,
          retryFailedCallsWithGreaterLimit: {
            gasLimitMultiplier: retryGasMultiplier,
          },
        },
      )

      for (const [index, result] of res.results.entries()) {
        const { pool } = bitmapIndexes[index]
        if (!result.success || !result.result) {
          if (disableFilterNoTicks) {
            ticksByPool[normalizePoolKey(pool)] = ticksByPool[normalizePoolKey(pool)] ?? []
          }
          continue
        }

        const data = decodeFunctionResult({
          abi: tickLensAbi,
          functionName: 'getPopulatedTicksInWord',
          data: result.result as `0x${string}`,
        }) as { tick: number; liquidityNet: bigint; liquidityGross: bigint }[]

        const newTicks = data
          ?.map(
            ({ tick, liquidityNet, liquidityGross }) =>
              new Tick({
                index: tick,
                liquidityNet,
                liquidityGross,
              }),
          )
          .reverse()

        if (!newTicks?.length) {
          if (disableFilterNoTicks) {
            ticksByPool[normalizePoolKey(pool)] = ticksByPool[normalizePoolKey(pool)] ?? []
          }
          continue
        }

        const key = normalizePoolKey(pool)
        ticksByPool[key] = [...(ticksByPool[key] ?? []), ...newTicks]
      }
    }
  }

  const infinityPools = pools.filter((pool): pool is InfinityClPool => pool.type === PoolType.InfinityCL)
  if (infinityPools.length) {
    const tickLensAddress = INFI_CL_TICK_LENS_ADDRESSES[chainId]
    if (!tickLensAddress) {
      throw new Error('Fill pools with ticks failed. No Infinity tick lens found.')
    }

    const bitmapIndexes = infinityPools.flatMap((pool) =>
      buildInfinityBitmapIndexList({
        currentTick: pool.tick,
        tickSpacing: pool.tickSpacing,
        pool,
      }),
    )

    if (bitmapIndexes.length) {
      const res = await multicallByGasLimit(
        bitmapIndexes.map(({ pool, bitmapIndex }) => ({
          target: tickLensAddress as Address,
          callData: encodeFunctionData({
            abi: infinityCLTickLensAbi,
            args: [pool.id, bitmapIndex],
            functionName: 'getPopulatedTicksInWord',
          }),
          gasLimit: gasLimitPerCall,
        })),
        {
          chainId,
          client,
          gasLimit,
          retryFailedCallsWithGreaterLimit: {
            gasLimitMultiplier: retryGasMultiplier,
          },
        },
      )

      for (const [index, result] of res.results.entries()) {
        const { pool } = bitmapIndexes[index]
        if (!result.success || !result.result) {
          if (disableFilterNoTicks) {
            ticksByPool[normalizePoolKey(pool)] = ticksByPool[normalizePoolKey(pool)] ?? []
          }
          continue
        }

        const data = decodeFunctionResult({
          abi: infinityCLTickLensAbi,
          functionName: 'getPopulatedTicksInWord',
          data: result.result as `0x${string}`,
        }) as { tick: number; liquidityNet: bigint; liquidityGross: bigint }[]

        const newTicks = data
          ?.map(
            ({ tick, liquidityNet, liquidityGross }) =>
              new Tick({
                index: tick,
                liquidityNet,
                liquidityGross,
              }),
          )
          .reverse()

        if (!newTicks?.length) {
          if (disableFilterNoTicks) {
            ticksByPool[normalizePoolKey(pool)] = ticksByPool[normalizePoolKey(pool)] ?? []
          }
          continue
        }

        const key = normalizePoolKey(pool)
        ticksByPool[key] = [...(ticksByPool[key] ?? []), ...newTicks]
      }
    }
  }

  if (!disableFilterNoTicks) {
    for (const key of Object.keys(ticksByPool)) {
      if (!ticksByPool[key]?.length) {
        delete ticksByPool[key]
      }
    }
  }

  for (const key of Object.keys(ticksByPool)) {
    ticksByPool[key] = ticksByPool[key].sort((a, b) => a.index - b.index)
  }

  return ticksByPool
}
