import { Protocol } from '@pancakeswap/farms'
import { BinPool, getCurrencyPriceFromId } from '@pancakeswap/infinity-sdk'
import useAllTicksQuery, { BinTickData, BinTicks } from 'hooks/useAllTicksQuery'
import { TickProcessed } from 'hooks/v3/types'
import { useActiveLiquidityByPool } from 'hooks/v3/usePoolTickData'
import isUndefined from 'lodash/isUndefined'
import { useCallback, useMemo } from 'react'
import { getActiveTick } from 'utils/getActiveTick'
import { Address } from 'viem'

import { useCurrencyByPoolId } from './useCurrencyByPoolId'
import { usePoolById } from './usePool'

export function usePoolActiveLiquidity(
  poolId?: Address,
  chainId?: number,
): {
  isLoading: boolean
  error: Error | null
  activeTick: number | undefined
  data: TickProcessed[] | undefined
} {
  const [, pool] = usePoolById<'CL'>(poolId, chainId)

  const { currency0, currency1 } = useCurrencyByPoolId({ poolId, chainId })
  const activeTick = useMemo(
    () => getActiveTick(pool?.tickCurrent, pool?.tickSpacing),
    [pool?.tickCurrent, pool?.tickSpacing],
  )

  const {
    data: ticks,
    isLoading,
    error,
  } = useAllTicksQuery({
    chainId,
    poolAddress: poolId,
    interval: 30000,
    enabled: true,
    protocol: Protocol.InfinityCLAMM,
    activeTick,
  })

  const { data } = useActiveLiquidityByPool({
    currencyA: currency0,
    currencyB: currency1,
    ticks,
    pool: {
      tickSpacing: pool?.tickSpacing,
      tickCurrent: pool?.tickCurrent,
      liquidity: pool?.liquidity,
    },
  })

  return useMemo(() => {
    if (!currency0 || !currency1 || activeTick === undefined || !ticks || ticks.length === 0 || isLoading) {
      return {
        isLoading,
        error,
        activeTick,
        data: undefined,
      }
    }
    return {
      isLoading,
      error,
      activeTick,
      data,
    }
  }, [activeTick, currency0, currency1, data, error, isLoading, ticks])
}

export function useBinPoolActiveLiquidity(
  poolId?: Address,
  chainId?: number,
): {
  isLoading: boolean
  error: Error | null
  activeBinId: number | undefined
  data: BinTickProcessed[] | undefined
} {
  const [, pool] = usePoolById<'Bin'>(poolId, chainId)
  const {
    data: ticks,
    isLoading,
    error,
  } = useAllTicksQuery({
    chainId,
    poolAddress: poolId,
    interval: 30000,
    enabled: true,
    protocol: Protocol.InfinityBIN,
  })

  const { data, activeBinId } = useBinActiveLiquidityByPool({
    pool,
    ticks,
  })

  return useMemo(() => {
    if (activeBinId === undefined || !ticks || ticks.length === 0 || isLoading) {
      return {
        isLoading,
        error,
        activeBinId,
        data: undefined,
      }
    }
    return {
      isLoading,
      error,
      activeBinId,
      data,
    }
  }, [activeBinId, data, error, isLoading, ticks])
}

export type BinTickProcessed = Pick<TickProcessed, 'liquidityActive' | 'price0'> &
  BinTickData & {
    price1: string
  }

const useBinActiveLiquidityByPool = ({ ticks, pool }: { ticks?: BinTicks; pool?: BinPool | null }) => {
  const process = useCallback(
    (currentTick: BinTickData) => {
      if (!pool) {
        return {
          ...currentTick,
          liquidityActive: BigInt(currentTick.liquidity ?? 0),
          price0: '0',
          price1: '0',
        }
      }
      const price0_ = getCurrencyPriceFromId(currentTick.binId, pool.binStep, pool.token0, pool.token1)
      return {
        ...currentTick,
        liquidityActive: BigInt(currentTick.liquidity ?? 0),
        price0: price0_.toFixed(8),
        price1: price0_.numerator === 0n ? '0' : price0_.invert().toFixed(8),
      }
    },
    [pool],
  )

  return useMemo(() => {
    const currentTick = ticks?.find(({ binId }) => binId === pool?.activeId)
    if (!pool || !ticks || !currentTick || isUndefined(pool?.binStep)) {
      return {
        data: undefined,
        activeBinId: pool?.activeId,
      }
    }
    const pivot = ticks?.indexOf(currentTick) - 1
    if (pivot < 0) {
      return {
        data: undefined,
        activeBinId: pool?.activeId,
      }
    }
    const activeTickProcessed = process(currentTick)

    const subsequentTicks = computeSurroundingTicks(activeTickProcessed, ticks, pivot, true, process)

    const previousTicks = computeSurroundingTicks(activeTickProcessed, ticks, pivot, false, process)

    const ticksProcessed = previousTicks.concat(activeTickProcessed).concat(subsequentTicks)

    return {
      data: ticksProcessed,
      activeBinId: currentTick.binId,
    }
  }, [pool, ticks, process])
}

function computeSurroundingTicks<T, K>(
  activeTickProcessed: T,
  sortedTickData: K[],
  pivot: number,
  ascending: boolean,
  cb: (currentTick: K, previousTick: T) => T,
): T[] {
  let previousTickProcessed: T = {
    ...activeTickProcessed,
  }
  let processedTicks: T[] = []
  for (let i = pivot + (ascending ? 1 : -1); ascending ? i < sortedTickData.length : i >= 0; ascending ? i++ : i--) {
    const currentTickProcessed = cb(sortedTickData[i], previousTickProcessed)
    processedTicks.push(currentTickProcessed)
    previousTickProcessed = currentTickProcessed
  }

  if (!ascending) {
    processedTicks = processedTicks.reverse()
  }

  return processedTicks
}
