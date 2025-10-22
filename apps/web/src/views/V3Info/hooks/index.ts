import { ChainId, isSolana } from '@pancakeswap/chains'
import { Protocol } from '@pancakeswap/farms'
import { useMemo } from 'react'
import { usePoolInfo } from 'state/farmsV4/hooks'
import { multiChainId } from 'state/info/constant'
import { useChainNameByQuery } from 'state/info/hooks'

import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { chainIdToExplorerInfoChainName, explorerApiClient } from 'state/info/api/client'
import { useExplorerChainNameByQuery } from 'state/info/api/hooks'
import { components } from 'state/info/api/schema'
import { fetchPoolsForToken } from 'state/info/queries/tokens/fetchPoolsForToken'
import { fetchTokenChartData } from 'state/info/queries/tokens/fetchTokenChartData'
import { fetchedTokenData } from 'state/info/queries/tokens/fetchTokenData'
import {
  ChartDayData,
  PoolChartEntry,
  PoolDataForView,
  PriceChartEntry,
  ProtocolDataForView,
  TokenChartEntry,
  TokenDataForView,
  Transaction,
} from 'state/info/types'
import { transformPoolData } from 'state/info/utils'
import { getPercentChange } from 'views/V3Info/utils/data'
import { type SolanaV3PoolInfo } from 'state/farmsV4/state/type'
import { fetchPoolChartData } from '../data/pool/chartData'
import { fetchedPoolData } from '../data/pool/poolData'
import { PoolTickData, fetchTicksSurroundingPrice } from '../data/pool/tickData'
import { fetchPoolTransactions } from '../data/pool/transactions'
import { fetchChartData } from '../data/protocol/chart'
import { fetchProtocolData } from '../data/protocol/overview'
import { fetchTopTransactions } from '../data/protocol/transactions'
import { fetchSearchResults } from '../data/search'
import { fetchPairPriceChartTokenData, fetchTokenPriceData } from '../data/token/priceData'
import { fetchTokenTransactions } from '../data/token/transactions'

const QUERY_SETTINGS_IMMUTABLE = {
  retryDelay: 3000,
  placeholderData: keepPreviousData,
  refetchOnMount: false,
  refetchOnReconnect: false,
  refetchOnWindowFocus: false,
}

export const useProtocolChartData = (): ChartDayData[] | undefined => {
  const chainName = useChainNameByQuery()
  const chainId = multiChainId[chainName]
  const explorerChainName = useExplorerChainNameByQuery()

  const { data: chartData } = useQuery({
    queryKey: [`v3/info/protocol/ProtocolChartData/${chainId}`, chainId],
    queryFn: ({ signal }) => fetchChartData('v3', explorerChainName!, signal),
    enabled: Boolean(explorerChainName),
    ...QUERY_SETTINGS_IMMUTABLE,
  })
  return useMemo(() => chartData?.data ?? [], [chartData])
}

export const useProtocolData = (): ProtocolDataForView | undefined => {
  const chainName = useChainNameByQuery()
  const chainId = multiChainId[chainName]
  const explorerChainName = useExplorerChainNameByQuery()

  const { data } = useQuery({
    queryKey: [`v3/info/protocol/ProtocolData/${chainId}`, chainId],
    queryFn: ({ signal }) => fetchProtocolData(explorerChainName!, signal),
    enabled: Boolean(explorerChainName),
    ...QUERY_SETTINGS_IMMUTABLE,
  })
  return data?.data ?? undefined
}

export const useProtocolTransactionData = (): Transaction[] | undefined => {
  const chainName = useChainNameByQuery()
  const chainId = multiChainId[chainName]
  const explorerChainName = useExplorerChainNameByQuery()

  const { data } = useQuery({
    queryKey: [`v3/info/protocol/ProtocolTransactionData/${chainId}`, chainId],
    queryFn: ({ signal }) => fetchTopTransactions(explorerChainName!, signal),
    enabled: Boolean(explorerChainName),
    ...QUERY_SETTINGS_IMMUTABLE,
  })
  return useMemo(() => data?.filter((d) => d.amountUSD > 0) ?? [], [data])
}

// this is for the swap page and ROI calculator
export const usePairPriceChartTokenData = (
  address?: string,
  duration?: 'hour' | 'day' | 'week' | 'month' | 'year',
  targetChainId?: ChainId,
  enabled = true,
): { data: PriceChartEntry[] | undefined; maxPrice?: number; minPrice?: number; averagePrice?: number } => {
  const chainName = useChainNameByQuery()
  const chainId = targetChainId ?? (chainName ? multiChainId[chainName] : undefined)

  const { data } = useQuery({
    queryKey: [`v3/info/token/pairPriceChartToken/${address}/${duration}`, targetChainId ?? chainId],

    queryFn: async ({ signal }) => {
      return fetchPairPriceChartTokenData(
        address!,
        chainIdToExplorerInfoChainName[chainId!],
        Protocol.V3,
        duration ?? 'day',
        signal,
      )
    },

    enabled: Boolean(
      enabled && chainId && chainIdToExplorerInfoChainName[chainId] && address && address !== 'undefined',
    ),
    ...QUERY_SETTINGS_IMMUTABLE,
  })
  return useMemo(
    () => ({
      data: data?.data ?? [],
      maxPrice: data?.maxPrice,
      minPrice: data?.minPrice,
      averagePrice: data?.averagePrice,
    }),
    [data],
  )
}

export async function fetchTopTokens(chainName: components['schemas']['ChainName'], signal: AbortSignal) {
  try {
    const data = await explorerApiClient
      .GET('/cached/tokens/v3/{chainName}/list/top', {
        signal,
        params: {
          path: {
            chainName,
          },
        },
      })
      .then((res) => res.data)
    if (!data) {
      return {
        data: {},
        error: false,
      }
    }
    return {
      data: data.reduce(
        (acc, item) => {
          // eslint-disable-next-line no-param-reassign
          acc[item.id] = {
            ...item,
            address: item.id,
            volumeUSD: parseFloat(item.volumeUSD24h || '0'),
            volumeUSDWeek: parseFloat(item.volumeUSD7d || '0'),
            tvlUSD: parseFloat(item.tvlUSD),
            volumeUSDChange: 0,
            tvlUSDChange: 0,
            exists: false,
            txCount: item.txCount24h,
            feesUSD: parseFloat(item.feeUSD24h),
            tvlToken: 0,
            priceUSDChange: getPercentChange(item.priceUSD, item.priceUSD24h),
            priceUSDChangeWeek: 0,
            priceUSD: parseFloat(item.priceUSD),
          }
          return acc
        },
        {} as {
          [address: string]: TokenDataForView
        },
      ),
      error: false,
    }
  } catch (e) {
    console.error(e)
    return {
      data: {},
      error: true,
    }
  }
}

export const useTopTokensData = ():
  | {
      [address: string]: TokenDataForView
    }
  | undefined => {
  const chainName = useChainNameByQuery()
  const chainId = multiChainId[chainName]
  const explorerChainName = useExplorerChainNameByQuery()

  const { data } = useQuery({
    queryKey: [`v3/info/token/TopTokensData/${chainId}`, chainId],

    queryFn: ({ signal }) => fetchTopTokens(explorerChainName!, signal),
    enabled: Boolean(explorerChainName),
    ...QUERY_SETTINGS_IMMUTABLE,
  })
  return data?.data
}

export const useTokenData = (address: string): TokenDataForView | undefined => {
  const chainName = useChainNameByQuery()
  const chainId = multiChainId[chainName]
  const explorerChainName = useExplorerChainNameByQuery()

  const { data } = useQuery({
    queryKey: [`v3/info/token/tokenData/${chainId}/${address}`, chainId],

    queryFn: ({ signal }) => fetchedTokenData(explorerChainName!, address, signal),

    enabled: Boolean(explorerChainName && address && address !== 'undefined'),
    ...QUERY_SETTINGS_IMMUTABLE,
  })

  return data?.data
}

export const useTokenChartData = (address: string): TokenChartEntry[] | undefined => {
  const chainName = useChainNameByQuery()
  const chainId = multiChainId[chainName]
  const explorerChainName = useExplorerChainNameByQuery()

  const { data } = useQuery({
    queryKey: [`v3/info/token/tokenChartData/${chainId}/${address}`, chainId],
    queryFn: ({ signal }) => fetchTokenChartData('v3', explorerChainName!, address, signal),
    enabled: Boolean(explorerChainName && address && address !== 'undefined'),
    ...QUERY_SETTINGS_IMMUTABLE,
  })
  return data?.data
}

export const useTokenPriceData = (
  address: string,
  duration: 'day' | 'week' | 'month' | 'year',
  protocol: 'v3' | 'infinityCl' | 'infinityBin' = 'v3',
): PriceChartEntry[] | undefined => {
  const chainName = useChainNameByQuery()
  const chainId = multiChainId[chainName]
  const explorerChainName = useExplorerChainNameByQuery()

  const { data } = useQuery({
    queryKey: [`${protocol}/info/token/tokenPriceData/${chainId}/${address}/${duration}`, chainId],

    queryFn: ({ signal }) => fetchTokenPriceData(address, protocol, duration, explorerChainName!, signal),

    enabled: Boolean(explorerChainName && address && address !== 'undefined'),
    ...QUERY_SETTINGS_IMMUTABLE,
  })
  return data?.data
}

export const useTokenTransactions = (address: string): Transaction[] | undefined => {
  const chainName = useChainNameByQuery()
  const chainId = multiChainId[chainName]
  const explorerChainName = useExplorerChainNameByQuery()

  const { data } = useQuery({
    queryKey: [`v3/info/token/tokenTransaction/${chainId}/${address}`, chainId],
    queryFn: ({ signal }) => fetchTokenTransactions(address, explorerChainName!, signal),
    enabled: Boolean(explorerChainName && address && address !== 'undefined'),
    ...QUERY_SETTINGS_IMMUTABLE,
  })
  return useMemo(() => data?.data?.filter((d) => d.amountUSD > 0), [data])
}

export async function fetchTopPools(chainName: components['schemas']['ChainName'], signal: AbortSignal) {
  try {
    const data = await explorerApiClient
      .GET('/cached/pools/v3/{chainName}/list/top', {
        signal,
        params: {
          path: {
            chainName,
          },
        },
      })
      .then((res) => res.data)
    if (!data) {
      return {
        data: {},
        error: false,
      }
    }
    return {
      data: data.reduce(
        (acc, item) => {
          return {
            ...acc,
            [item.id]: transformPoolData(item),
          }
        },
        {} as {
          [address: string]: PoolDataForView
        },
      ),
      error: false,
    }
  } catch (e) {
    console.error(e)
    return {
      data: {},
      error: true,
    }
  }
}

export const useTopPoolsData = ():
  | {
      [address: string]: PoolDataForView
    }
  | undefined => {
  const chainName = useChainNameByQuery()
  const chainId = multiChainId[chainName]
  const explorerChainName = useExplorerChainNameByQuery()

  const { data } = useQuery({
    queryKey: [`v3/info/pool/TopPoolsData/${chainId}`, chainId],

    queryFn: async ({ signal }) => {
      return fetchTopPools(explorerChainName!, signal)
    },
    enabled: Boolean(explorerChainName),
    ...QUERY_SETTINGS_IMMUTABLE,
  })
  return data?.data
}

export const usePoolsDataForToken = (address: string): PoolDataForView[] | undefined => {
  const chainName = useChainNameByQuery()
  const explorerChainName = useExplorerChainNameByQuery()

  const { data } = useQuery({
    queryKey: [`v3/info/pool/poolsDataForToken/${chainName}/${address}`],

    queryFn: ({ signal }) => {
      return fetchPoolsForToken(address, explorerChainName!, signal)
    },
    enabled: Boolean(explorerChainName && address && address !== 'undefined'),
    ...QUERY_SETTINGS_IMMUTABLE,
  })
  return data?.data
}

export const usePoolData = (address: string): PoolDataForView | undefined => {
  const chainName = useChainNameByQuery()
  const chainId = multiChainId[chainName]
  const explorerChainName = useExplorerChainNameByQuery()

  const { data } = useQuery({
    queryKey: [`v3/info/pool/poolData/${chainId}/${address}`, chainId],

    queryFn: ({ signal }) => fetchedPoolData(explorerChainName!, address, signal),

    enabled: Boolean(explorerChainName && address && address !== 'undefined'),
    ...QUERY_SETTINGS_IMMUTABLE,
  })
  return data?.data
}
export const usePoolTransactions = (address?: string): Transaction[] | undefined => {
  const chainName = useChainNameByQuery()
  const chainId = multiChainId[chainName]
  const explorerChainName = useExplorerChainNameByQuery()

  const { data } = useQuery({
    queryKey: [`v3/info/pool/poolTransaction/${chainId}/${address}`, chainId],
    queryFn: ({ signal }) => fetchPoolTransactions(address!, explorerChainName!, signal),
    enabled: Boolean(explorerChainName && address && address !== 'undefined'),
    ...QUERY_SETTINGS_IMMUTABLE,
  })
  return useMemo(() => data?.data?.filter((d) => d.amountUSD > 0) ?? undefined, [data])
}

export const usePoolChartData = (address: string): PoolChartEntry[] | undefined => {
  const chainName = useChainNameByQuery()
  const chainId = multiChainId[chainName]
  const explorerChainName = useExplorerChainNameByQuery()

  const { data } = useQuery({
    queryKey: [`v3/info/pool/poolChartData/${chainId}/${address}`, chainId],
    queryFn: ({ signal }) => fetchPoolChartData(Protocol.V3, explorerChainName!, address, signal),
    enabled: Boolean(explorerChainName && address && address !== 'undefined'),
    ...QUERY_SETTINGS_IMMUTABLE,
  })
  return data?.data
}

const FEE_TIER_TO_TICK_SPACING = (feeTier: number): number => {
  switch (feeTier) {
    case 10000:
      return 200
    case 2500:
      return 50
    case 500:
      return 10
    case 100:
      return 1
    default:
      throw Error(`Tick spacing for fee tier ${feeTier} undefined.`)
  }
}

export const usePoolTickData = (address?: string): PoolTickData | undefined => {
  const chainName = useChainNameByQuery()
  const chainId = multiChainId[chainName]
  const explorerChainName = useExplorerChainNameByQuery()
  const poolInfo = usePoolInfo({ poolAddress: address, chainId })

  const { data } = useQuery({
    queryKey: [`v3/info/pool/poolTickData/${chainId}/${address}`, chainId, poolInfo?.feeTier],
    queryFn: ({ signal }) => {
      if (!explorerChainName || !address || !poolInfo?.feeTier) {
        return undefined
      }
      return fetchTicksSurroundingPrice({
        poolAddress: address,
        chainName: explorerChainName,
        chainId,
        signal,
        protocol: Protocol.V3,
        tickSpacing: isSolana(chainId)
          ? (poolInfo as SolanaV3PoolInfo).rawPool.config.tickSpacing
          : FEE_TIER_TO_TICK_SPACING(poolInfo.feeTier),
      })
    },
    enabled: Boolean(explorerChainName && address && poolInfo?.feeTier),
    ...QUERY_SETTINGS_IMMUTABLE,
  })
  return data?.data ?? undefined
}

export const useInfinityCLPoolTickData = (address?: string, tickSpacing?: number): PoolTickData | undefined => {
  const chainName = useChainNameByQuery()
  const chainId = multiChainId[chainName]
  const explorerChainName = useExplorerChainNameByQuery()

  const { data } = useQuery({
    queryKey: [`info/pool/poolTickData`, chainId, address, Protocol.InfinityCLAMM, tickSpacing],
    queryFn: ({ signal }) => {
      if (!explorerChainName || !address || !tickSpacing) {
        return undefined
      }
      return fetchTicksSurroundingPrice({
        poolAddress: address,
        chainName: explorerChainName,
        chainId,
        signal,
        protocol: Protocol.InfinityCLAMM,
        tickSpacing,
      })
    },
    enabled: Boolean(explorerChainName && address && tickSpacing),
    ...QUERY_SETTINGS_IMMUTABLE,
  })
  return data?.data ?? undefined
}

export const useSearchData = (searchValue: string, enabled = true) => {
  const chainName = useChainNameByQuery()
  const explorerChainName = useExplorerChainNameByQuery()

  const { data, status, error } = useQuery({
    queryKey: [`v3/info/pool/searchData/${chainName}/${searchValue}`, chainName],

    queryFn: ({ signal }) => {
      return fetchSearchResults(explorerChainName!, searchValue, signal)
    },

    enabled: Boolean(explorerChainName && searchValue && enabled),
    ...QUERY_SETTINGS_IMMUTABLE,
  })
  const searchResult = useMemo(() => {
    if (data) {
      return {
        ...data,
        loading: status !== 'success',
        error,
      }
    }
    return {
      tokens: [],
      pools: [],
      loading: true,
      error,
    }
  }, [data, status, error])
  return searchResult
}
