import { useMemo, useCallback } from 'react'
import { FetchPoolParams, solToWSol, ApiV3PoolInfoItem, PoolFetchType } from '@pancakeswap/solana-core-sdk'
import { shallow } from 'zustand/shallow'
import useSWRInfinite from 'swr/infinite'
import useSWR, { KeyedMutator } from 'swr'
import { getPoolsByMints } from '@pancakeswap/solana-clmm-sdk'
import axios from '@/api/axios'
import { MINUTE_MILLISECONDS } from '@/utils/date'
import { useAppStore, useTokenStore } from '@/store'
import { formatPoolData, formatAprData } from './formatter'
import { ReturnPoolType, ReturnFormattedPoolType, PoolsApiReturnType } from './type'

type FetcherReturnType = Awaited<ReturnType<typeof fetcher>>

const fetcher = (url: string) =>
  axios.get<PoolsApiReturnType, PoolsApiReturnType>(url, {
    skipError: true
  })

export default function useFetchPoolByMint<T extends PoolFetchType>(
  props: {
    shouldFetch?: boolean
    showFarms?: boolean
    mint1?: string
    mint2?: string
    poolId?: string
    refreshInterval?: number
    type?: T
  } & Omit<FetchPoolParams, 'type'>
): {
  selectedPool?: ReturnPoolType<T>
  data: ReturnPoolType<T>[]
  formattedData: ReturnFormattedPoolType<T>[]
  formattedSelectedPool?: ReturnPoolType<T>
  isLoadEnded: boolean
  // loadMore: () => void
  size: number
  // mutate: KeyedMutator<FetcherReturnType[]>
  isValidating: boolean
  isLoading: boolean
} {
  const {
    shouldFetch = true,
    showFarms,
    mint1: propMint1 = '',
    mint2: propMint2 = '',
    type = PoolFetchType.All,
    sort = 'default',
    order = 'desc',
    pageSize = 100,
    refreshInterval = MINUTE_MILLISECONDS,
    poolId
  } = props || {}

  const [mint1, mint2] = [propMint1 ? solToWSol(propMint1).toBase58() : propMint1, propMint2 ? solToWSol(propMint2).toBase58() : propMint2]
  const [host, mintUrl] = useAppStore((s) => [s.urlConfigs.BASE_HOST, s.urlConfigs.POOL_LIST], shallow)
  const [baseMint, quoteMint] = useMemo(() => {
    if (!mint1 || !mint2) return [mint1, mint2]
    return mint2 && mint1 > mint2 ? [mint2, mint1] : [mint1, mint2]
  }, [mint1, mint2])
  const url = (!mint1 && !mint2) || !shouldFetch ? null : host + mintUrl

  const { data, error, ...swrProps } = useSWR(
    url
      ? {
          mintA: baseMint ?? mint1,
          mintB: quoteMint ?? mint2,
          poolType: showFarms ? `${type}Farm` : type,
          poolSortField: sort,
          sortType: order,
          pageSize,
          page: 1
        }
      : null,
    getPoolsByMints,
    {
      dedupingInterval: refreshInterval,
      focusThrottleInterval: refreshInterval,
      refreshInterval
    }
  )

  // const loadMore = useCallback(() => setSize((s) => s + 1), [type, sort, order])

  const resData = useMemo(
    // () => (data || []).reduce((acc, cur) => acc.concat(cur?.data || []).filter(Boolean), [] as ApiV3PoolInfoItem[]).map(formatAprData),
    () => ((data as ApiV3PoolInfoItem[]) || []).map((pool) => formatAprData(pool)),
    [data]
  ) as ReturnPoolType<T>[]
  const orgTokenList = useTokenStore((s) => s.displayTokenList)
  const formattedData = useMemo(
    () => resData.map((i) => formatPoolData(i, orgTokenList)),
    [resData, orgTokenList]
  ) as ReturnFormattedPoolType<T>[]
  const selectedPool = resData && poolId ? (resData.find((d) => d.id === poolId) as ReturnPoolType<T>) : undefined
  const isLoadEnded = !swrProps.isLoading && (!resData.length || !!error)

  return {
    selectedPool,
    data: resData,
    size: data?.count ? Number(data.count) : 0,
    formattedData,
    formattedSelectedPool: selectedPool
      ? (formatPoolData(selectedPool as ApiV3PoolInfoItem, orgTokenList) as ReturnFormattedPoolType<T>)
      : undefined,
    isLoadEnded,
    // loadMore,
    ...swrProps
  }
}
