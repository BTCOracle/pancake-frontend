import { useMemo } from 'react'
import useSWR from 'swr'
import { shallow } from 'zustand/shallow'
import axios from '@/api/axios'
import { useAppStore } from '@/store'
import { isValidPublicKey } from '@/utils/publicKey'

interface PointData {
  time: string
  liquidity: string
}

interface ChartData {
  count: number
  line: PointData[]
}

interface APIChartData {
  success: boolean
  data: [
    {
      date: string
      timestamp: number
      liquidity: number
      dayId: number
    }
  ]
  poolId: string
  count: number
}

const fetcher = (url: string) => axios.get<APIChartData, APIChartData>(url, { skipError: true })

const formatData = (data?: APIChartData): ChartData => {
  if (!data?.data) {
    return {
      count: 0,
      line: []
    }
  }
  return {
    count: data.count,
    line: data.data.map((d) => ({
      time: d.timestamp.toString(),
      liquidity: d.liquidity.toString()
    }))
  }
}

export default function useFetchPoolChartLiquidity(props: {
  disable?: boolean
  shouldFetch?: boolean
  id?: string
  refreshInterval?: number
}) {
  const { shouldFetch = true, id = '', disable = false, refreshInterval = 1000 * 60 * 5 } = props || {}
  const isValidId = isValidPublicKey(id)
  const [host, lineUrl] = useAppStore((s) => [s.urlConfigs.BASE_HOST, s.urlConfigs.POOL_LIQUIDITY_LINE], shallow)
  const url = id && shouldFetch && isValidId && !disable ? host + lineUrl : null

  const { data, isLoading, error, ...rest } = useSWR(url ? `${url}?poolId=${id}` : url, fetcher, {
    dedupingInterval: refreshInterval,
    focusThrottleInterval: refreshInterval,
    refreshInterval
  })
  const isEmptyResult = !!id && !isLoading && !(data && !error)

  const formattedData = useMemo(() => formatData(data), [data])

  return {
    data: formattedData.line || [],
    isLoading,
    error,
    isEmptyResult,
    ...rest
  }
}
