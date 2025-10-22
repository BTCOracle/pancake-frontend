import { isSolana } from '@pancakeswap/chains'
import { Protocol } from '@pancakeswap/farms'
import isUndefinedOrNull from '@pancakeswap/utils/isUndefinedOrNull'
import { useQuery } from '@tanstack/react-query'
import { INFINITY_PROTOCOLS, InfinityProtocol } from 'config/constants/protocols'
import { useMemo } from 'react'
import { chainIdToExplorerInfoChainName, explorerApiClient } from 'state/info/api/client'

export type ChartSupportedProtocol = InfinityProtocol | Protocol.V3

export type AllTicksQuery = {
  ticks: Array<{
    tick: string
    liquidityNet: string
    liquidityGross: string
  }>
}

export type Ticks = AllTicksQuery['ticks']
export type TickData = Ticks[number]
export type BinTicks = {
  binId: number
  liquidity: string
  reserveY: string
  reserveX: string
  totalShares: string
}[]
export type BinTickData = BinTicks[number]

type AllTicksQueryReturnType<T> = {
  error: Error | null
  isLoading: boolean
  data?: T extends Protocol.InfinityBIN ? BinTicks : Ticks
}

export default function useAllTicksQuery<T extends Protocol = Protocol.V3>({
  chainId,
  poolAddress,
  interval,
  enabled = true,
  protocol,
  activeTick,
}: {
  chainId?: number
  poolAddress?: string | undefined
  interval: number
  enabled: boolean
  protocol?: T
  activeTick?: number
}): AllTicksQueryReturnType<T> {
  const { data, isLoading, error } = useQuery({
    queryKey: ['useAllTicksQuery', poolAddress, chainId, protocol],
    queryFn: async ({ signal }) => {
      if (!chainId || !poolAddress || !protocol || ![...INFINITY_PROTOCOLS, Protocol.V3].includes(protocol)) {
        return undefined
      }
      if (protocol === Protocol.InfinityBIN) {
        return getBinPoolTicks(chainId, poolAddress, signal)
      }
      return getPoolTicks({
        activeTick,
        chainId,
        poolAddress,
        protocol: protocol as ChartSupportedProtocol,
        signal,
      })
    },
    enabled: Boolean(enabled && poolAddress && chainId && protocol),
    refetchInterval: interval,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  })

  return useMemo(
    () => ({
      error,
      isLoading,
      data: data as AllTicksQueryReturnType<T>['data'],
    }),
    [data, error, isLoading],
  )
}

export const getBinPoolTicks = async (chainId: number, poolId: string, signal?: AbortSignal) => {
  const chainName = chainIdToExplorerInfoChainName[chainId]
  if (!chainName) {
    return []
  }
  const resp = await explorerApiClient.GET('/cached/pools/infinityBin/{chainName}/liquidity/{pool}', {
    signal,
    params: {
      path: {
        chainName,
        pool: poolId.toLowerCase(),
      },
    },
  })

  return resp.data ?? []
}

export async function getPoolTicks({
  chainId,
  poolAddress,
  protocol,
  signal,
  activeTick,
}: {
  chainId: number
  poolAddress: string
  protocol: Protocol.V3 | InfinityProtocol
  _blockNumber?: string
  signal?: AbortSignal
  activeTick?: number
}): Promise<Ticks> {
  const chainName = chainIdToExplorerInfoChainName[chainId]
  if (!chainName) {
    return []
  }
  const pool = isSolana(chainId) ? poolAddress : poolAddress.toLowerCase()

  let max = 10
  let after: string | undefined
  const allTicks: Ticks = []

  // eslint-disable-next-line no-constant-condition
  while (true) {
    if (!after && max < 10) {
      break
    }
    if (max <= 0) {
      if (!isUndefinedOrNull(activeTick)) {
        const lastTick = allTicks.length > 0 ? allTicks[allTicks.length - 1] : undefined
        if (lastTick && Number(lastTick.tick) < activeTick!) {
          max += 3
        } else {
          break
        }
      } else {
        break
      }
    }
    max--

    // eslint-disable-next-line no-await-in-loop
    const resp = await explorerApiClient.GET('/cached/pools/ticks/{protocol}/{chainName}/{pool}', {
      signal,
      params: {
        path: {
          protocol,
          chainName,
          pool,
        },
        query: {
          after,
        },
      },
    })

    if (!resp.data || resp.data.rows.length === 0) {
      break
    }
    if (resp.data.hasNextPage && resp.data.endCursor) {
      after = resp.data.endCursor
    } else {
      after = undefined
    }

    resp.data.rows.forEach((tick) => {
      allTicks.push({
        tick: tick.tickIdx.toString(),
        liquidityNet: tick.liquidityNet,
        liquidityGross: tick.liquidityGross,
      })
    })
  }

  return allTicks
}
