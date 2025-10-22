import { useMemo } from 'react'
import useSwr from 'swr'
import Decimal from 'decimal.js'
import { useAppStore } from '@/store/useAppStore'
import axios from '@/api/axios'

export interface ChartEntry {
  activeLiquidity: number
  price0: number
}

interface PointData {
  price: string
  liquidity: string
}

const fetcher = ([url, data]: [string, { poolId: string }]) =>
  axios.get<{
    count: number
    line: PointData[]
  }>(`${url}?poolId=${data.poolId}`)

export function useDensityChartData({ poolId, baseIn }: { poolId: string; baseIn: boolean }) {
  const urlConfigs = useAppStore((s) => s.urlConfigs)
  const { data, isLoading } = useSwr(poolId ? [urlConfigs.BASE_HOST + urlConfigs.POOL_POSITION_LINE, { poolId }] : null, fetcher, {
    dedupingInterval: 60 * 1000,
    focusThrottleInterval: 60 * 1000,
    refreshInterval: 60 * 1000
  })
  const points: PointData[] = useMemo(() => data?.data.line || [], [data])

  return useMemo(() => {
    return {
      isLoading,
      error: undefined,
      formattedData: baseIn
        ? points.map((val) => ({ activeLiquidity: parseFloat(val.liquidity), price0: parseFloat(val.price) }))
        : points
            .map((val) => ({ activeLiquidity: parseFloat(val.liquidity), price0: parseFloat(new Decimal(1).div(val.price).toString()) }))
            .reverse()
    }
  }, [points, baseIn, isLoading])
}
