import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { STABLE_SUPPORTED_CHAIN_IDS } from '@pancakeswap/stable-swap-sdk'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import BigNumber from 'bignumber.js'
import { Transaction, TransactionType, TvlChartEntry, VolumeChartEntry } from 'state/info/types'
import { getAprsForStableFarm } from 'utils/getAprsForStableFarm'
import { getLpFeesAndApr } from 'utils/getLpFeesAndApr'
import { getPercentChange } from 'utils/infoDataHelpers'
import { explorerApiClient } from './api/client'
import { useExplorerChainNameByQuery } from './api/hooks'
import { components, operations, paths } from './api/schema'
import { MultiChainName, MultiChainNameExtend, checkIsInfinity, checkIsStableSwap, multiChainId } from './constant'
import {
  fetchV2ChartsTvlData,
  fetchV2ChartsVolumeData,
  fetchV2PoolsForToken,
  fetchV2TokenData,
  fetchV2TransactionData,
  transformPoolsForToken,
  transformToken,
  transformTransactionData,
} from './dataQuery'
import { PoolData, PriceChartEntry, ProtocolData, TokenData } from './types'

dayjs.extend(duration)

// Protocol hooks

const refreshIntervalForInfo = 15000 // 15s
const QUERY_SETTINGS_IMMUTABLE = {
  refetchOnReconnect: false,
  refetchOnMount: false,
  refetchOnWindowFocus: false,
}
const QUERY_SETTINGS_WITHOUT_INTERVAL_REFETCH = {
  retryDelay: 3000,
}
const QUERY_SETTINGS_INTERVAL_REFETCH = {
  refetchInterval: refreshIntervalForInfo,
  placeholderData: keepPreviousData,
  ...QUERY_SETTINGS_WITHOUT_INTERVAL_REFETCH,
}

const getProtocol = () => {
  if (checkIsStableSwap()) return 'stable'
  if (checkIsInfinity()) return 'infinity'

  return 'v2'
}

type ProtocolStatsRequest = paths['/cached/protocol/{protocol}/{chainName}/stats']['get']['parameters']['path']
type ProtocolStats = {
  volumeUSD: number
  volumeUSDChange: number
  liquidityUSD: number
  liquidityUSDChange: number
  txCount: number
  txCountChange: number
}

const getProtocolStats = async (
  protocol: ProtocolStatsRequest['protocol'],
  chainName: ProtocolStatsRequest['chainName'],
  signal: AbortSignal,
): Promise<ProtocolStats> => {
  const resp = await explorerApiClient.GET('/cached/protocol/{protocol}/{chainName}/stats', {
    signal,
    params: {
      path: {
        protocol,
        chainName,
      },
    },
  })

  if (resp.data) {
    const { data } = resp
    const volumeUSD = data.volumeUSD24h ? Number.parseFloat(data.volumeUSD24h) : 0
    const volumeOneWindowAgo =
      data.volumeUSD24h && data.volumeUSD48h
        ? Number.parseFloat(data.volumeUSD48h) - Number.parseFloat(data.volumeUSD24h)
        : undefined
    const volumeUSDChange =
      volumeUSD && volumeOneWindowAgo ? getPercentChange(volumeUSD, volumeOneWindowAgo) : undefined
    const tvlUSDChange = getPercentChange(+data.tvlUSD, +data.tvlUSD24h)
    const txCount = data.txCount24h

    const txCountOneWindowAgo = data.txCount24h && data.txCount48h ? data.txCount48h - data.txCount24h : undefined
    const txCountChange = txCount && txCountOneWindowAgo ? getPercentChange(txCount, txCountOneWindowAgo) : 0
    return {
      volumeUSD,
      volumeUSDChange: typeof volumeUSDChange === 'number' ? volumeUSDChange : 0,
      liquidityUSD: +data.tvlUSD,
      liquidityUSDChange: tvlUSDChange,
      txCount,
      txCountChange,
    }
  }

  throw new Error('No data')
}

const composeProtocolStats = async (
  protocols: ProtocolStatsRequest['protocol'][],
  chainName: ProtocolStatsRequest['chainName'],
  signal: AbortSignal,
): Promise<ProtocolStats> => {
  const [stats0, stats1] = await Promise.all(protocols.map((protocol) => getProtocolStats(protocol, chainName, signal)))

  return {
    volumeUSD: stats0.volumeUSD + stats1.volumeUSD,
    volumeUSDChange: getPercentChange(stats0.volumeUSD, stats1.volumeUSD),
    liquidityUSD: stats0.liquidityUSD + stats1.liquidityUSD,
    liquidityUSDChange: getPercentChange(stats0.liquidityUSD, stats1.liquidityUSD),
    txCount: stats0.txCount + stats1.txCount,
    txCountChange: getPercentChange(stats0.txCount, stats1.txCount),
  }
}

export const useProtocolDataQuery = (): ProtocolData | undefined => {
  const chainName = useExplorerChainNameByQuery()
  const protocol = getProtocol()
  const { data: protocolData } = useQuery({
    queryKey: [`info/protocol/updateProtocolData2/${protocol}`, chainName],
    queryFn: async ({ signal }) => {
      if (!chainName) {
        throw new Error('No chain name')
      }
      if (protocol === 'infinity') {
        return composeProtocolStats(['infinityCl', 'infinityBin'], chainName, signal)
      }
      return getProtocolStats(protocol, chainName, signal)
    },
    enabled: Boolean(chainName),
    ...QUERY_SETTINGS_IMMUTABLE,
    ...QUERY_SETTINGS_WITHOUT_INTERVAL_REFETCH,
  })
  return protocolData ?? undefined
}

type ProtocolChartDataTvlRequest =
  paths['/cached/protocol/chart/{protocol}/{chainName}/tvl']['get']['parameters']['path']
type ProtocolChartDataTvl = {
  date: number
  liquidityUSD: number
}

const getProtocolChartDataTvl = async (
  protocol: ProtocolChartDataTvlRequest['protocol'],
  chainName: ProtocolChartDataTvlRequest['chainName'],
  signal: AbortSignal,
): Promise<ProtocolChartDataTvl[]> => {
  const resp = await explorerApiClient.GET('/cached/protocol/chart/{protocol}/{chainName}/tvl', {
    signal,
    params: {
      path: {
        chainName,
        protocol,
      },
      query: {
        groupBy: '1D',
      },
    },
  })

  return (
    resp.data?.map((d) => {
      return {
        date: dayjs(d.bucket as string).unix(),
        liquidityUSD: d.tvlUSD ? +d.tvlUSD : 0,
      }
    }) ?? []
  )
}

const composeProtocolChartDataTvl = async (
  protocols: ProtocolChartDataTvlRequest['protocol'][],
  chainName: ProtocolChartDataTvlRequest['chainName'],
  signal: AbortSignal,
): Promise<ProtocolChartDataTvl[]> => {
  const [stats0, stats1] = await Promise.all(
    protocols.map((protocol) => getProtocolChartDataTvl(protocol, chainName, signal)),
  )

  const dateToTvl = new Map<number, number>()

  for (const stat of [...stats0, ...stats1]) {
    if (dateToTvl.has(stat.date)) {
      dateToTvl.set(stat.date, dateToTvl.get(stat.date)! + stat.liquidityUSD)
    } else {
      dateToTvl.set(stat.date, stat.liquidityUSD)
    }
  }

  return Array.from(dateToTvl.entries())
    .map(([date, liquidityUSD]) => ({
      date,
      liquidityUSD,
    }))
    .sort((a, b) => a.date - b.date)
}

export const useProtocolChartDataTvlQuery = (): TvlChartEntry[] | undefined => {
  const chainName = useExplorerChainNameByQuery()
  const type = checkIsStableSwap() ? 'stableSwap' : 'swap'
  const protocol = getProtocol()
  const { data: chartData } = useQuery({
    queryKey: [`info/protocol/chart/tvl/${type}`, chainName],
    queryFn: async ({ signal }) => {
      if (!chainName) {
        throw new Error('No chain name')
      }
      if (protocol === 'infinity') {
        return composeProtocolChartDataTvl(['infinityCl', 'infinityBin'], chainName, signal)
      }
      return getProtocolChartDataTvl(protocol, chainName, signal)
    },
    ...QUERY_SETTINGS_IMMUTABLE,
    ...QUERY_SETTINGS_WITHOUT_INTERVAL_REFETCH,
  })
  return chartData ?? undefined
}

type ProtocolChartDataVolumeRequest =
  paths['/cached/protocol/chart/{protocol}/{chainName}/volume']['get']['parameters']['path']
type ProtocolChartDataVolume = {
  date: number
  volumeUSD: number
}

const getProtocolChartDataVolume = async (
  protocol: ProtocolChartDataVolumeRequest['protocol'],
  chainName: ProtocolChartDataVolumeRequest['chainName'],
  signal: AbortSignal,
): Promise<ProtocolChartDataVolume[]> => {
  const resp = await explorerApiClient.GET('/cached/protocol/chart/{protocol}/{chainName}/volume', {
    signal,
    params: {
      path: {
        chainName,
        protocol,
      },
      query: {
        groupBy: '1D',
      },
    },
  })

  return (
    resp.data?.map((d) => {
      return {
        date: dayjs(d.bucket as string).unix(),
        volumeUSD: d.volumeUSD ? +d.volumeUSD : 0,
      }
    }) ?? []
  )
}

const composeProtocolChartDataVolume = async (
  protocols: ProtocolChartDataVolumeRequest['protocol'][],
  chainName: ProtocolChartDataVolumeRequest['chainName'],
  signal: AbortSignal,
): Promise<ProtocolChartDataVolume[]> => {
  const [stats0, stats1] = await Promise.all(
    protocols.map((protocol) => getProtocolChartDataVolume(protocol, chainName, signal)),
  )

  const dateToVolume = new Map<number, number>()

  for (const stat of [...stats0, ...stats1]) {
    if (dateToVolume.has(stat.date)) {
      dateToVolume.set(stat.date, dateToVolume.get(stat.date)! + stat.volumeUSD)
    } else {
      dateToVolume.set(stat.date, stat.volumeUSD)
    }
  }

  return Array.from(dateToVolume.entries())
    .map(([date, volumeUSD]) => ({
      date,
      volumeUSD,
    }))
    .sort((a, b) => a.date - b.date)
}

export const useProtocolChartDataVolumeQuery = (): VolumeChartEntry[] | undefined => {
  const chainName = useExplorerChainNameByQuery()
  const type = checkIsStableSwap() ? 'stableSwap' : 'swap'
  const protocol = getProtocol()
  const { data: chartData } = useQuery({
    queryKey: [`info/protocol/chart/volume/${type}`, chainName],
    queryFn: async ({ signal }) => {
      if (!chainName) {
        throw new Error('No chain name')
      }
      if (protocol === 'infinity') {
        return composeProtocolChartDataVolume(['infinityCl', 'infinityBin'], chainName, signal)
      }
      return getProtocolChartDataVolume(protocol, chainName, signal)
    },
    ...QUERY_SETTINGS_IMMUTABLE,
    ...QUERY_SETTINGS_WITHOUT_INTERVAL_REFETCH,
  })
  return chartData ?? undefined
}

export const useProtocolTransactionsQuery = (): Transaction[] | undefined => {
  const chainName = useExplorerChainNameByQuery()
  const chainId = useChainIdByQuery()
  const protocol = getProtocol()
  const { data: transactions } = useQuery({
    queryKey: [`info/protocol/updateProtocolTransactionsData2/${protocol}`, chainName],
    queryFn: async ({ signal }) => {
      if (!chainName) {
        throw new Error('No chain name')
      }
      if (protocol === 'stable' && STABLE_SUPPORTED_CHAIN_IDS.includes(chainId as number)) {
        return explorerApiClient
          .GET('/cached/tx/stable/{chainName}/recent', {
            signal,
            params: {
              path: {
                chainName:
                  chainName as operations['getCachedTxStableByChainNameRecent']['parameters']['path']['chainName'],
              },
            },
          })
          .then((res) => res.data)
      }

      if (protocol === 'infinity') {
        return explorerApiClient
          .GET('/cached/tx/infinity/{chainName}/recent', {
            signal,
            params: {
              path: {
                chainName,
              },
            },
          })
          .then((res) => res.data)
      }

      return explorerApiClient
        .GET('/cached/tx/v2/{chainName}/recent', {
          signal,
          params: {
            path: {
              chainName,
            },
          },
        })
        .then((res) => res.data)
    },
    select: useCallback((data_) => {
      return data_?.map((d) => {
        return {
          hash: d.transactionHash,
          timestamp: dayjs(d.timestamp as string)
            .unix()
            .toString(),
          sender: d.origin ?? '0x',
          type:
            d.type === 'swap' ? TransactionType.SWAP : d.type === 'mint' ? TransactionType.MINT : TransactionType.BURN,
          token0Symbol: d.token0.symbol ?? 'Unknown',
          token1Symbol: d.token1.symbol ?? 'Unknown',
          token0Address: d.token0.id,
          token1Address: d.token1.id,
          amountUSD: +d.amountUSD,
          amountToken0: +d.amount0,
          amountToken1: +d.amount1,
        }
      })
    }, []),
    ...QUERY_SETTINGS_IMMUTABLE,

    // update latest Transactions per 15s
    ...QUERY_SETTINGS_INTERVAL_REFETCH,
  })
  return transactions ?? undefined
}

export const useAllPoolDataQuery = () => {
  const chainName = useExplorerChainNameByQuery()
  const chainId = useChainIdByQuery()
  const protocol = getProtocol()
  const { data } = useQuery({
    queryKey: [`info/pools2/data/${protocol}`, chainName],
    queryFn: async () => {
      if (!chainName) {
        throw new Error('No chain name')
      }
      if (protocol === 'stable' && STABLE_SUPPORTED_CHAIN_IDS.includes(chainId as number)) {
        return explorerApiClient
          .GET('/cached/pools/stable/{chainName}/list/top', {
            params: {
              path: {
                chainName:
                  chainName as operations['getCachedPoolsStableByChainNameListTop']['parameters']['path']['chainName'],
              },
            },
          })
          .then((res) => res.data)
      }
      if (protocol === 'infinity') {
        return explorerApiClient
          .GET('/cached/pools/infinity/{chainName}/list/top', {
            params: {
              path: {
                chainName,
              },
            },
          })
          .then((res) => res.data)
      }
      return explorerApiClient
        .GET('/cached/pools/v2/{chainName}/list/top', {
          params: {
            path: {
              chainName,
            },
          },
        })
        .then((res) => res.data)
    },
    enabled: Boolean(chainName),
    ...QUERY_SETTINGS_IMMUTABLE,
    ...QUERY_SETTINGS_WITHOUT_INTERVAL_REFETCH,
    select: useCallback((data_) => {
      if (!data_) {
        throw new Error('No data')
      }

      const final: {
        [address: string]: {
          data: PoolData
        }
      } = {}

      for (const d of data_) {
        const { totalFees24h, totalFees7d, lpFees24h, lpFees7d, lpApr7d } = getLpFeesAndApr(
          +d.volumeUSD24h,
          +d.volumeUSD7d,
          +d.tvlUSD,
        )
        final[d.id] = {
          data: {
            address: d.id,
            lpAddress: d.lpAddress,
            timestamp: dayjs(d.createdAtTimestamp as string).unix(),
            token0: {
              address: d.token0.id,
              symbol: d.token0.symbol,
              name: d.token0.name,
              decimals: d.token0.decimals,
            },
            token1: {
              address: d.token1.id,
              symbol: d.token1.symbol,
              name: d.token1.name,
              decimals: d.token1.decimals,
            },
            feeTier: d.feeTier,
            volumeUSD: +d.volumeUSD24h,
            volumeUSDChange: 0,
            volumeUSDWeek: +d.volumeUSD7d,
            liquidityUSD: +d.tvlUSD,
            liquidityUSDChange: getPercentChange(+d.tvlUSD, d.tvlUSD24h ? +d.tvlUSD24h : 0),
            totalFees24h,
            totalFees7d,
            lpFees24h,
            lpFees7d,
            lpApr7d,
            liquidityToken0: +d.tvlToken0,
            liquidityToken1: +d.tvlToken1,
            token0Price: +d.token0Price,
            token1Price: +d.token1Price,
            volumeUSDChangeWeek: 0,
          },
        }
      }

      return final
    }, []),
  })
  return useMemo(() => {
    return data ?? {}
  }, [data])
}

export function usePoolDataQuery(poolAddress: string): PoolData | undefined {
  const chainName = useExplorerChainNameByQuery()
  const chainId = useChainIdByQuery()
  const type = checkIsStableSwap() ? 'stableSwap' : 'swap'
  const { data } = useQuery({
    queryKey: [`info/pool/data/${poolAddress}/${type}`, chainName],
    queryFn: async ({ signal }) => {
      if (!chainName) {
        throw new Error('No chain name')
      }
      if (type === 'stableSwap' && STABLE_SUPPORTED_CHAIN_IDS.includes(chainId as number)) {
        return explorerApiClient
          .GET('/cached/pools/stable/{chainName}/{address}', {
            signal,
            params: {
              path: {
                chainName:
                  chainName as operations['getCachedPoolsStableByChainNameByAddress']['parameters']['path']['chainName'],
                address: poolAddress,
              },
            },
          })
          .then((res) => res.data)
      }
      return explorerApiClient
        .GET('/cached/pools/v2/{chainName}/{address}', {
          signal,
          params: {
            path: {
              chainName,
              address: poolAddress,
            },
          },
        })
        .then((res) => res.data)
    },
    select: useCallback((data_) => {
      if (!data_) {
        throw new Error('No data')
      }

      const { totalFees24h, totalFees7d, lpFees24h, lpFees7d, lpApr7d } = getLpFeesAndApr(
        +data_.volumeUSD24h,
        +data_.volumeUSD7d,
        +data_.tvlUSD,
      )

      return {
        address: data_.id,
        lpAddress: data_.lpAddress,
        timestamp: dayjs(data_.createdAtTimestamp as string).unix(),
        token0: {
          address: data_.token0.id,
          symbol: data_.token0.symbol,
          name: data_.token0.name,
          decimals: data_.token0.decimals,
        },
        token1: {
          address: data_.token1.id,
          symbol: data_.token1.symbol,
          name: data_.token1.name,
          decimals: data_.token1.decimals,
        },
        volumeUSD: +data_.volumeUSD24h,
        volumeUSDChange: 0,
        volumeUSDWeek: +data_.volumeUSD7d,
        liquidityUSD: +data_.tvlUSD,
        liquidityUSDChange: getPercentChange(+data_.tvlUSD, data_.tvlUSD24h ? +data_.tvlUSD24h : 0),
        totalFees24h,
        totalFees7d,
        lpFees24h,
        lpFees7d,
        lpApr7d,
        liquidityToken0: +data_.tvlToken0,
        liquidityToken1: +data_.tvlToken1,
        token0Price: +data_.token0Price,
        token1Price: +data_.token1Price,
        volumeUSDChangeWeek: 0,
        feeTier: data_.feeTier,
      }
    }, []),
    enabled: Boolean(chainName && poolAddress),
    ...QUERY_SETTINGS_IMMUTABLE,
    ...QUERY_SETTINGS_WITHOUT_INTERVAL_REFETCH,
  })
  return data
}

export const usePoolChartTvlDataQuery = (address: string): TvlChartEntry[] | undefined => {
  const chainName = useExplorerChainNameByQuery()
  const type = checkIsStableSwap() ? 'stableSwap' : 'swap'
  const { data } = useQuery({
    queryKey: [`info/pool/chartData/tvl/${address}/${type}`, chainName],
    queryFn: async ({ signal }) => {
      if (!chainName) {
        throw new Error('No chain name')
      }
      return explorerApiClient
        .GET('/cached/pools/chart/{protocol}/{chainName}/{address}/tvl', {
          signal,
          params: {
            path: {
              address,
              chainName,
              protocol: type === 'stableSwap' ? 'stable' : 'v2',
            },
            query: {
              period: '1Y',
            },
          },
        })
        .then((res) =>
          res?.data?.map((d) => ({
            date: dayjs(d.bucket as string).unix(),
            liquidityUSD: d.tvlUSD ? +d.tvlUSD : 0,
          })),
        )
    },
    enabled: Boolean(chainName),
    ...QUERY_SETTINGS_IMMUTABLE,
    ...QUERY_SETTINGS_WITHOUT_INTERVAL_REFETCH,
  })
  return data ?? undefined
}
export const usePoolChartVolumeDataQuery = (address: string): VolumeChartEntry[] | undefined => {
  const chainName = useExplorerChainNameByQuery()
  const type = checkIsStableSwap() ? 'stableSwap' : 'swap'
  const { data } = useQuery({
    queryKey: [`info/pool/chartData/volume/${address}/${type}`, chainName],
    queryFn: async ({ signal }) => {
      if (!chainName) {
        throw new Error('No chain name')
      }
      return explorerApiClient
        .GET('/cached/pools/chart/{protocol}/{chainName}/{address}/volume', {
          signal,
          params: {
            path: {
              address,
              chainName,
              protocol: type === 'stableSwap' ? 'stable' : 'v2',
            },
            query: {
              period: '1Y',
            },
          },
        })
        .then((res) =>
          res.data?.map((d) => ({
            date: dayjs(d.bucket as string).unix(),
            volumeUSD: d.volumeUSD ? +d.volumeUSD : 0,
          })),
        )
    },
    enabled: Boolean(chainName),
    ...QUERY_SETTINGS_IMMUTABLE,
    ...QUERY_SETTINGS_WITHOUT_INTERVAL_REFETCH,
  })
  return data ?? undefined
}

export const usePoolTransactionsQuery = (address: string): Transaction[] | undefined => {
  const chainName = useExplorerChainNameByQuery()
  const chainId = useChainIdByQuery()
  const type = checkIsStableSwap() ? 'stableSwap' : 'swap'
  const { data } = useQuery({
    queryKey: [`info/pool/transactionsData2/${address}/${type}`, chainName],
    queryFn: async ({ signal }) => {
      if (!chainName) {
        throw new Error('No chain name')
      }
      if (type === 'stableSwap' && STABLE_SUPPORTED_CHAIN_IDS.includes(chainId as number)) {
        return explorerApiClient
          .GET('/cached/tx/stable/{chainName}/recent', {
            signal,
            params: {
              path: {
                chainName:
                  chainName as operations['getCachedTxStableByChainNameRecent']['parameters']['path']['chainName'],
              },
              query: {
                pool: address,
              },
            },
          })
          .then((res) => res.data)
      }
      return explorerApiClient
        .GET('/cached/tx/v2/{chainName}/recent', {
          signal,
          params: {
            path: {
              chainName,
            },
            query: {
              pool: address,
            },
          },
        })
        .then((res) => res.data)
    },
    select: useCallback((data_) => {
      if (!data_) {
        throw new Error('No data')
      }
      return data_.map((d) => {
        return {
          type:
            d.type === 'swap' ? TransactionType.SWAP : d.type === 'mint' ? TransactionType.MINT : TransactionType.BURN,
          hash: d.transactionHash,
          timestamp: dayjs(d.timestamp as string)
            .unix()
            .toString(),
          sender: d.origin ?? d.recipient ?? 'Unknown',
          amountUSD: +d.amountUSD,
          amountToken0: +d.amount0,
          amountToken1: +d.amount1,
          token0Symbol: d.token0.symbol ?? 'Unknown',
          token1Symbol: d.token1.symbol ?? 'Unknown',
          token0Address: d.token0.id,
          token1Address: d.token1.id,
        }
      })
    }, []),
    ...QUERY_SETTINGS_IMMUTABLE,
    ...QUERY_SETTINGS_WITHOUT_INTERVAL_REFETCH,
  })
  return data ?? undefined
}

// Tokens hooks

export const useAllTokenDataQuery = (): {
  [address: string]: { data?: TokenData }
} => {
  const chainName = useExplorerChainNameByQuery()
  const chainId = useChainIdByQuery()
  const protocol = getProtocol()
  const { data } = useQuery({
    queryKey: [`info/token/data2/${protocol}`, chainName],
    queryFn: async ({ signal }) => {
      if (!chainName) {
        throw new Error('No chain name')
      }
      const final: { [address: string]: { data?: TokenData } } = {}
      let data_

      if (protocol === 'stable' && STABLE_SUPPORTED_CHAIN_IDS.includes(chainId as number)) {
        data_ = await explorerApiClient
          .GET('/cached/tokens/stable/{chainName}/list/top', {
            signal,
            params: {
              path: {
                chainName:
                  chainName as operations['getCachedTokensStableByChainNameListTop']['parameters']['path']['chainName'],
              },
            },
          })
          .then((res) => res.data)
      } else if (protocol === 'infinity') {
        data_ = await explorerApiClient
          .GET('/cached/tokens/infinity/{chainName}/list/top', {
            signal,
            params: {
              path: {
                chainName,
              },
            },
          })
          .then((res) => res.data)
      } else {
        data_ = await explorerApiClient
          .GET('/cached/tokens/v2/{chainName}/list/top', {
            signal,
            params: {
              path: {
                chainName,
              },
            },
          })
          .then((res) => res.data)
      }

      for (const d of data_) {
        final[d.id] = {
          data: {
            exists: true,
            name: d.name,
            symbol: d.symbol,
            address: d.id,
            decimals: d.decimals,
            volumeUSD: d.volumeUSD24h ? +d.volumeUSD24h : 0,
            volumeUSDChange: 0,
            volumeUSDWeek: d.volumeUSD7d ? +d.volumeUSD7d : 0,
            txCount: d.txCount24h,
            liquidityToken: +d.tvl,
            liquidityUSD: +d.tvlUSD,
            tvlUSD: +d.tvlUSD,
            liquidityUSDChange: getPercentChange(+d.tvlUSD, +d.tvlUSD24h),
            tvlUSDChange: getPercentChange(+d.tvlUSD, +d.tvlUSD24h),
            priceUSD: +d.priceUSD,
            priceUSDChange: getPercentChange(+d.priceUSD, +d.priceUSD24h),
            priceUSDChangeWeek: getPercentChange(+d.priceUSD, +d.priceUSD7d),
          },
        }
      }

      return final
    },
    enabled: Boolean(chainName),
    ...QUERY_SETTINGS_IMMUTABLE,
    ...QUERY_SETTINGS_WITHOUT_INTERVAL_REFETCH,
  })

  return data ?? {}
}

const getTokenData = async (
  address: string,
  chainName: components['schemas']['ChainName'],
  protocol: components['schemas']['Protocol'],
  signal: AbortSignal,
) => {
  return explorerApiClient
    .GET(`/cached/tokens/${protocol}/{chainName}/{address}`, {
      signal,
      params: {
        path: {
          chainName,
          address,
        },
      },
    })
    .then((res) => res.data)
    .then(transformToken)
    .catch(() => undefined)
}

const getInfinityTokenData = async (
  address: string,
  chainName: components['schemas']['ChainName'],
  signal: AbortSignal,
) => {
  const [infinityClResult, infinityBinResult] = await Promise.allSettled([
    getTokenData(address, chainName, 'infinityCl', signal),
    getTokenData(address, chainName, 'infinityBin', signal),
  ])

  if (infinityClResult.status === 'fulfilled') {
    return infinityClResult.value
  }
  if (infinityBinResult.status === 'fulfilled') {
    return infinityBinResult.value
  }
  return undefined
}

export const useTokenDataQuery = (address: string | undefined): TokenData | undefined => {
  const chainName = useExplorerChainNameByQuery()
  const chainId = useChainIdByQuery()
  const type = checkIsStableSwap() ? 'stableSwap' : 'swap'
  const protocol = getProtocol()

  const { data } = useQuery({
    queryKey: [`info/token/data/${address}/${type}/`, chainName],
    queryFn: async ({ signal }) => {
      if (!chainName || !address) {
        throw new Error('No chain name')
      }
      if (protocol === 'infinity') {
        return getInfinityTokenData(address, chainName, signal)
      }
      return fetchV2TokenData({
        signal,
        chainName:
          chainName as operations['getCachedTokensStableByChainNameByAddress']['parameters']['path']['chainName'],
        chainId,
        address,
        type,
      })
    },
    enabled: Boolean(address && chainName),
    ...QUERY_SETTINGS_IMMUTABLE,
    ...QUERY_SETTINGS_INTERVAL_REFETCH,
  })

  return data
}

const getPoolsForToken = async (
  address: string,
  protocol: components['schemas']['Protocol'],
  chainName: components['schemas']['ChainName'],
  signal: AbortSignal,
) => {
  return explorerApiClient
    .GET(`/cached/pools/${protocol}/{chainName}/list/top`, {
      signal,
      params: {
        path: {
          chainName,
        },
        query: {
          token: address,
        },
      },
    })
    .then((res) => res.data)
    .then(transformPoolsForToken)
    .catch(() => [])
}

const getInfinityPoolsForToken = async (
  address: string,
  chainName: components['schemas']['ChainName'],
  signal: AbortSignal,
) => {
  const [infinityCl, infinityBin] = await Promise.all([
    getPoolsForToken(address, 'infinityCl', chainName, signal),
    getPoolsForToken(address, 'infinityBin', chainName, signal),
  ])

  return [...(infinityCl ?? []), ...(infinityBin ?? [])]
}

export function usePoolsForTokenDataQuery(address: string): (PoolData | undefined)[] {
  const chainName = useExplorerChainNameByQuery()
  const chainId = useChainIdByQuery()
  const type = checkIsStableSwap() ? 'stableSwap' : 'swap'
  const protocol = getProtocol()
  const { data } = useQuery({
    queryKey: [`info/token/chartData2/${address}/${type}`, chainName],
    queryFn: async ({ signal }) => {
      if (!chainName || !address) {
        throw new Error('No chain name')
      }
      if (protocol === 'infinity') {
        return getInfinityPoolsForToken(address, chainName, signal)
      }

      return fetchV2PoolsForToken({
        signal,
        chainName: chainName as operations['getCachedPoolsStableByChainNameListTop']['parameters']['path']['chainName'],
        chainId,
        address,
        type,
      })
    },
    enabled: Boolean(address && chainName),
    ...QUERY_SETTINGS_IMMUTABLE,
    ...QUERY_SETTINGS_INTERVAL_REFETCH,
  })

  return data ?? []
}

export const useTokenChartTvlDataQuery = (address: string): TvlChartEntry[] | undefined => {
  const chainName = useExplorerChainNameByQuery()
  const type = checkIsStableSwap() ? 'stableSwap' : 'swap'
  const { data } = useQuery({
    queryKey: [`info/token/chartData/tvl/${address}/${type}`, chainName],
    queryFn: async ({ signal }) => {
      return fetchV2ChartsTvlData({
        signal,
        chainName:
          chainName as operations['getCachedTokensStableByChainNameByAddress']['parameters']['path']['chainName'],
        address,
        type,
      })
    },
    enabled: Boolean(chainName),
    ...QUERY_SETTINGS_IMMUTABLE,
    ...QUERY_SETTINGS_WITHOUT_INTERVAL_REFETCH,
  })
  return data ?? undefined
}
export const useTokenChartVolumeDataQuery = (address: string): VolumeChartEntry[] | undefined => {
  const chainName = useExplorerChainNameByQuery()
  const type = checkIsStableSwap() ? 'stableSwap' : 'swap'
  const { data } = useQuery({
    queryKey: [`info/token/chartData/volume/${address}/${type}`, chainName],
    queryFn: async ({ signal }) => {
      return fetchV2ChartsVolumeData({
        signal,
        chainName:
          chainName as operations['getCachedTokensStableByChainNameByAddress']['parameters']['path']['chainName'],
        address,
        type,
      })
    },
    enabled: Boolean(chainName),
    ...QUERY_SETTINGS_IMMUTABLE,
    ...QUERY_SETTINGS_WITHOUT_INTERVAL_REFETCH,
  })
  return data ?? undefined
}

export const useTokenPriceDataQuery = (
  address: string,
  _interval: number,
  _timeWindow: duration.Duration,
): PriceChartEntry[] | undefined => {
  const chainName = useExplorerChainNameByQuery()
  const type = checkIsStableSwap() ? 'stableSwap' : 'swap'
  const { data } = useQuery({
    queryKey: [`info/token/priceData2/${address}/${type}`, chainName],
    queryFn: async ({ signal }) => {
      if (!chainName) {
        throw new Error('No chain name')
      }
      const result = await explorerApiClient
        .GET('/cached/tokens/chart/{chainName}/{address}/{protocol}/price', {
          signal,
          params: {
            path: {
              chainName,
              address,
              protocol: type === 'stableSwap' ? 'stable' : 'v2',
            },
            query: {
              period: '1M',
            },
          },
        })
        .then((res) =>
          res.data?.map((d) => {
            return {
              time: dayjs(d.bucket as string).unix(),
              open: d.open ? +d.open : 0,
              close: d.close ? +d.close : 0,
              high: d.high ? +d.high : 0,
              low: d.low ? +d.low : 0,
            }
          }),
        )
      return result
    },
    ...QUERY_SETTINGS_IMMUTABLE,
    ...QUERY_SETTINGS_INTERVAL_REFETCH,
  })
  return data ?? undefined
}

const getTokenRecentTransactions = async (
  address: string,
  chainName: components['schemas']['ChainName'],
  protocol: components['schemas']['Protocol'],
  signal: AbortSignal,
) => {
  return explorerApiClient
    .GET(`/cached/tx/${protocol}/{chainName}/recent`, {
      signal,
      params: {
        path: {
          chainName,
        },
        query: {
          token: address,
        },
      },
    })
    .then((res) => res.data)
    .then(transformTransactionData)
    .catch(() => [])
}

const getInfinityTokenRecentTransactions = async (
  address: string,
  chainName: components['schemas']['ChainName'],
  signal: AbortSignal,
) => {
  if (!chainName) {
    throw new Error('No chain name')
  }
  const [infinityCl, infinityBin] = await Promise.all([
    getTokenRecentTransactions(address, chainName, 'infinityCl', signal),
    getTokenRecentTransactions(address, chainName, 'infinityBin', signal),
  ])
  return [...(infinityCl ?? []), ...(infinityBin ?? [])]
}

export const useTokenTransactionsQuery = (address: string): Transaction[] | undefined => {
  const chainName = useExplorerChainNameByQuery()
  const chainId = useChainIdByQuery()
  const protocol = getProtocol()
  const { data } = useQuery({
    queryKey: [`info/token/transactionsData/${address}/${protocol}`, chainName],
    queryFn: async ({ signal }) => {
      if (protocol === 'infinity') {
        return getInfinityTokenRecentTransactions(address, chainName as components['schemas']['ChainName'], signal)
      }
      return fetchV2TransactionData({
        signal,
        chainName: chainName as operations['getCachedTxStableByChainNameRecent']['parameters']['path']['chainName'],
        chainId,
        address,
        type: protocol === 'stable' ? 'stableSwap' : 'swap',
      })
    },
    ...QUERY_SETTINGS_IMMUTABLE,
    ...QUERY_SETTINGS_INTERVAL_REFETCH,
  })
  return data ?? undefined
}

export const useGetChainName = () => {
  const { pathname, query } = useRouter()

  const getChain = useCallback(() => {
    if (pathname.includes('eth') || query.chain === 'eth') return 'ETH'
    return 'BSC'
  }, [pathname, query])
  const [name, setName] = useState<MultiChainName | null>(() => getChain())
  const result = useMemo(() => name, [name])

  useEffect(() => {
    setName(getChain())
  }, [getChain])

  return result
}

export const useChainNameByQuery = (): MultiChainNameExtend => {
  const { query } = useRouter()
  const chainName = useMemo(() => {
    switch (query?.chainName) {
      case 'eth':
        return 'ETH'
      case 'zksync':
        return 'ZKSYNC'
      case 'arb':
        return 'ARB'
      case 'linea':
        return 'LINEA'
      case 'base':
        return 'BASE'
      case 'opbnb':
        return 'OPBNB'
      case 'bsc-testnet':
      case 'bscTestnet':
        return 'BSC_TESTNET'
      case 'solana':
        return 'SOLANA'
      default:
        return 'BSC'
    }
  }, [query])
  return chainName
}

export const useChainIdByQuery = () => {
  const chainName = useChainNameByQuery()
  const chainId = useMemo(() => {
    return multiChainId[chainName]
  }, [chainName])
  return chainId
}

const stableSwapAPRWithAddressesFetcher = async (addresses: string[], chainId?: number) => {
  return Promise.all(addresses.map((d) => getAprsForStableFarm(d, chainId)))
}

export const useStableSwapTopPoolsAPR = (addresses: string[]): Record<string, number> => {
  const isStableSwap = checkIsStableSwap()
  const chainName = useChainNameByQuery()
  const { data } = useQuery<BigNumber[]>({
    queryKey: [`info/pool/stableAPRs/Addresses/`, chainName],
    queryFn: () => stableSwapAPRWithAddressesFetcher(addresses, multiChainId[chainName]),
    enabled: Boolean(isStableSwap && addresses?.length > 0) && Boolean(chainName),
    ...QUERY_SETTINGS_IMMUTABLE,
    ...QUERY_SETTINGS_WITHOUT_INTERVAL_REFETCH,
  })
  const addressWithAPR = useMemo(() => {
    const result: Record<string, number> = {}
    data?.forEach((d, index) => {
      result[addresses[index]] = d?.toNumber()
    })
    return result
  }, [addresses, data])
  return useMemo(() => {
    return isStableSwap ? addressWithAPR : {}
  }, [isStableSwap, addressWithAPR])
}

export const useMultiChainPath = () => {
  const router = useRouter()
  const { chainName } = router.query
  return chainName ? `/${chainName}` : ''
}

export const useStableSwapPath = () => {
  return checkIsStableSwap() ? '?type=stableSwap' : ''
}
