import { BigintIsh } from '@pancakeswap/swap-sdk-core'
import { Tick, FeeAmount, TICK_SPACINGS } from '@pancakeswap/v3-sdk'

import { OnChainProvider, V3Pool, InfinityClPool, PoolType } from '../v3-router/types'
import { fetchCompactPoolsTick } from './compactTickQuery.helper'
import { fetchTickLenPoolsTick } from './tickLenQuery.helper'

type WithMulticallGasLimit = {
  gasLimit?: BigintIsh
}

type WithClientProvider = {
  clientProvider?: OnChainProvider
}

export type CombinedTickQueryParams = {
  pools: (V3Pool | InfinityClPool)[]
  disableFilterNoTicks?: boolean
} & WithClientProvider &
  WithMulticallGasLimit

/**
 * Combined tick query that tries tickLen first as the default query, then falls back to compact ticks
 * only when tickLen fails to find ticks for the pool. This provides comprehensive tick coverage
 * by using the more reliable tickLens approach first and falling back to compact ticks when needed.
 */
export async function fetchCombinedPoolsTick({
  pools,
  clientProvider,
  gasLimit,
  disableFilterNoTicks,
}: CombinedTickQueryParams): Promise<Record<string, Tick[]>> {
  if (!pools.length) {
    return {}
  }

  // First try to fetch tickLen ticks as the default approach
  const tickLenTicksByPool = await fetchTickLenPoolsTick({
    pools,
    clientProvider,
    gasLimit,
    disableFilterNoTicks,
  })

  // Identify pools that need compact tick fallback (when tickLen failed to find ticks)
  const poolsNeedingCompactFallback: (V3Pool | InfinityClPool)[] = []
  const finalTicksByPool: Record<string, Tick[]> = {}

  // First pass: categorize pools based on tickLen results
  for (const pool of pools) {
    const poolKey = getPoolKey(pool)
    const tickLenTicks = tickLenTicksByPool[poolKey] || []

    if (tickLenTicks.length === 0) {
      // No tickLen ticks found, need compact tick fallback
      poolsNeedingCompactFallback.push(pool)
    } else {
      // tickLen found ticks, use them directly
      finalTicksByPool[poolKey] = tickLenTicks
    }
  }

  // Second pass: fetch compact ticks for pools that need fallback
  if (poolsNeedingCompactFallback.length > 0) {
    const compactTicksByPool = await fetchCompactPoolsTick({
      pools: poolsNeedingCompactFallback,
      clientProvider,
      gasLimit,
    })

    // Process compact fallback pools
    for (const pool of poolsNeedingCompactFallback) {
      const poolKey = getPoolKey(pool)
      const compactTicks = compactTicksByPool[poolKey] || []

      if (compactTicks.length > 0) {
        // Compact ticks found, use them
        finalTicksByPool[poolKey] = compactTicks
      } else if (disableFilterNoTicks) {
        // Still no ticks found, add empty array if disableFilterNoTicks is true
        finalTicksByPool[poolKey] = []
      }
    }
  }

  return finalTicksByPool
}

/**
 * Get the pool key for indexing
 */
function getPoolKey(pool: V3Pool | InfinityClPool): string {
  if (pool.type === PoolType.V3) {
    return pool.address.toLowerCase()
  }
  return pool.id.toLowerCase()
}
