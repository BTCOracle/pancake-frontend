import { useCallback, useMemo } from 'react'
import useSWRInfinite from 'swr/infinite'
import { KeyedMutator } from 'swr'
import { shallow } from 'zustand/shallow'
import { ApiV3PoolInfoItem, PoolFetchType } from '@pancakeswap/solana-core-sdk'
import axios from '@/api/axios'
import { useAppStore, useTokenStore } from '@/store'
import { MINUTE_MILLISECONDS } from '@/utils/date'
import { formatPoolData, formatAprData } from './formatter'
import { ReturnPoolType, ReturnFormattedPoolType, PoolsApiReturnType } from './type'

type FetcherReturnType = Awaited<ReturnType<typeof fetcher>>

let refreshTag = Date.now()
export const refreshPoolCache = () => {
  refreshTag = Date.now()
}

const fetcher = ([url]: [url: string]) =>
  axios.get<PoolsApiReturnType, PoolsApiReturnType>(url).then((res) => {
    return {
      data: {
        data: res?.data ?? [],
        count: res?.data.length,
        hasNextPage: res?.pagination.totalPages > res?.pagination.page
      }
    }
  })

const PAGE_SIZE = 100

export default function useFetchPoolList<T extends PoolFetchType>(props?: {
  type?: T
  pageSize?: number
  sort?: string
  order?: 'asc' | 'desc'
  refreshInterval?: number
  shouldFetch?: boolean
  showFarms?: boolean
}): {
  data: ReturnPoolType<T>[]
  formattedData: ReturnFormattedPoolType<T>[]
  isLoadEnded: boolean
  setSize: (size: number | ((_size: number) => number)) => Promise<FetcherReturnType[] | undefined>

  size: number
  loadMore: () => void
  mutate: KeyedMutator<FetcherReturnType[]>
  isValidating: boolean
  isLoading: boolean
  isEmpty: boolean
  error?: any
} {
  const {
    type = PoolFetchType.All,
    pageSize = PAGE_SIZE,
    sort = 'default',
    order = 'desc',
    refreshInterval = MINUTE_MILLISECONDS,
    shouldFetch = true,
    showFarms
  } = props || {}
  const [host, listUrl] = useAppStore((s) => [s.urlConfigs.BASE_HOST, s.urlConfigs.POOL_LIST], shallow)

  const url = `${host + listUrl}?poolType=${showFarms ? `${type}Farm` : type}&poolSortField=${sort}&order=${order}&pageSize=${pageSize}`

  const { data, setSize, error, ...swrProps } = useSWRInfinite(
    (index) => (shouldFetch ? [`${url}&page=${index + 1}`, refreshTag] : null),
    fetcher,
    {
      revalidateFirstPage: false,
      dedupingInterval: refreshInterval,
      focusThrottleInterval: refreshInterval,
      refreshInterval
    }
  )

  const issues = useMemo(() => {
    return (data || [])
      .reduce((acc, cur) => acc.concat(cur.data.data), [] as ApiV3PoolInfoItem[])
      .filter(Boolean)
      .map(formatAprData) as ReturnPoolType<T>[]
  }, [data])
  const orgTokenList = useTokenStore((s) => s.displayTokenList)

  const formattedData = useMemo(
    () => issues.map((i) => formatPoolData(i, orgTokenList)),
    [issues, orgTokenList]
  ) as ReturnFormattedPoolType<T>[]

  const lastData = data?.[data.length - 1]
  const isLoadEnded = !lastData || !lastData.data.hasNextPage || lastData.data.data.length < pageSize || !!error
  const loadMore = useCallback(() => setSize((s) => s + 1), [type, sort, order])
  const isEmpty = isLoadEnded && (!data || !data.length)

  return {
    ...swrProps,
    setSize,
    loadMore,
    error,
    data: issues,
    formattedData,
    isLoadEnded,
    isEmpty
  }
}
