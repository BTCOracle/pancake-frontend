import { useMemo } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { SLOW_INTERVAL } from 'config/constants'
import BigNumber from 'bignumber.js'

export interface ChartEntry {
  liquidity: number
  price0: number
  price1: number
  tick: number
}

interface PointData {
  price: string
  liquidity: string
  tick: number
}

async function fetchPoolChartData(poolId: string): Promise<ChartEntry[]> {
  try {
    const apiBaseUrl = process.env.NEXT_PUBLIC_SOL_EXPLORE_API_ENDPOINT!
    const searchUrl = '/cached/v1/pools/line/position'
    const response = await fetch(`${apiBaseUrl}${searchUrl}?poolId=${poolId}`)

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`)
    }

    const responseData = await response.json()

    let points: PointData[] = []
    if (responseData.line) {
      points = responseData.line
    } else if (responseData.data && responseData.data.line) {
      points = responseData.data.line
    } else if (Array.isArray(responseData)) {
      points = responseData
    }

    const result = points.map((val) => ({
      liquidity: parseFloat(val.liquidity),
      price0: parseFloat(val.price),
      price1: parseFloat(new BigNumber(1).div(val.price).toString()),
      tick: val.tick,
    }))
    return result
  } catch (error) {
    console.error('Error fetching pool chart data:', error)
    return []
  }
}

export function usePoolChartData(poolId: string | undefined) {
  const poolIdString = useMemo(() => poolId, [poolId])

  const { data, isLoading, error } = useQuery({
    queryKey: ['solanaPoolChartData', poolIdString],
    queryFn: () => fetchPoolChartData(poolId!),
    enabled: !!poolId,
    placeholderData: keepPreviousData,
    refetchInterval: SLOW_INTERVAL,
  })

  return useMemo(() => {
    if (!data) {
      return {
        isLoading,
        error,
        formattedData: [],
      }
    }

    return {
      isLoading,
      error,
      formattedData: data,
    }
  }, [data, isLoading, error])
}
