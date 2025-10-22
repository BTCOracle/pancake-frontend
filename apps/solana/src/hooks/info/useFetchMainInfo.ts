import useSWR from 'swr'
import { shallow } from 'zustand/shallow'
import axios from '@/api/axios'
import { useAppStore } from '@/store'

interface OverviewResponse {
  totalTvlUsd: number
  totalVolume24h: string
}
const fetcher = (url: string) => axios.get<OverviewResponse, OverviewResponse>(url, { skipError: true })

export default function useFetchMainInfo(props: { refreshInterval?: number }) {
  const { refreshInterval = 1000 * 60 * 15 } = props || {}

  const [host, infoUrl] = useAppStore((s) => [s.urlConfigs.BASE_HOST, s.urlConfigs.INFO], shallow)

  const { data, isLoading, error, ...rest } = useSWR(host + infoUrl, fetcher, {
    refreshInterval,
    dedupingInterval: refreshInterval,
    focusThrottleInterval: refreshInterval
  })
  const isEmptyResult = !isLoading && !(data && !error)

  return {
    data,
    isLoading,
    error,
    isEmptyResult,
    ...rest
  }
}
