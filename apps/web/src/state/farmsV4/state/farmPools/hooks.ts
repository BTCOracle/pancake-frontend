import { ChainId, isEvm, isTestnetChainId } from '@pancakeswap/chains'
import { Protocol, UniversalFarmConfig, fetchAllUniversalFarms, masterChefV3Addresses } from '@pancakeswap/farms'
import { masterChefAddresses } from '@pancakeswap/farms/src/const'
import { masterChefV3ABI } from '@pancakeswap/v3-sdk'
import { useQuery } from '@tanstack/react-query'
import { masterChefV2ABI } from 'config/abi/masterchefV2'
import { QUERY_SETTINGS_IMMUTABLE, SLOW_INTERVAL } from 'config/constants'
import dayjs from 'dayjs'
import groupBy from 'lodash/groupBy'
import keyBy from 'lodash/keyBy'
import { useMemo } from 'react'
import { isInfinityProtocol } from 'utils/protocols'
import { publicClient } from 'utils/viem'
import { isAddress, zeroAddress } from 'viem'
import { Address } from 'viem/accounts'

import { Campaign } from '@pancakeswap/achievements'
import { fetchCampaigns } from 'hooks/infinity/useCampaigns'
import mapValues from 'lodash/mapValues'
import { InfinityPoolInfo, PoolInfo, StablePoolInfo, V2PoolInfo } from '../type'
import {
  DEFAULT_CHAINS,
  DEFAULT_PROTOCOLS,
  fetchFarmPools,
  fetchPoolsTimeFrame,
  fetchV3PoolsStatusByChainId,
} from './fetcher'

type UnwrapPromise<T> = T extends Promise<infer U> ? U : T
type ArrayItemType<T> = T extends Array<infer U> ? U : T

export async function fetchFarmData(showTestnet: boolean) {
  const chainId = showTestnet
    ? DEFAULT_CHAINS
    : DEFAULT_CHAINS.filter((c) => isEvm(c) && !isTestnetChainId(c as ChainId))

  const [pools, farmConfig] = await Promise.all([
    fetchFarmPools({ chainId, protocols: DEFAULT_PROTOCOLS }),
    fetchAllUniversalFarms(),
  ])

  const [poolsStatus, poolsTimeFrame, infinityPoolsFarmingStatus] = await Promise.all([
    fetchMultiChainV3PoolsStatus(farmConfig),
    fetchMultiChainPoolsTimeFrame(farmConfig),
    fetchMultiChainPoolsFarmingStatus(farmConfig, showTestnet),
  ])

  const farms = pools.length ? (pools as PoolInfo[]) : farmConfig
  const poolsWithStatus: ((PoolInfo | UniversalFarmConfig) & { isActiveFarm?: boolean })[] = farms.map(
    (f: PoolInfo | UniversalFarmConfig) => {
      if (!f.lpAddress) {
        return f
      }
      if (isInfinityProtocol(f.protocol)) {
        return {
          ...f,
          isActiveFarm: !!infinityPoolsFarmingStatus[f.chainId]?.[f.lpAddress],
        }
      }
      if (f.protocol === Protocol.V3) {
        return {
          ...f,
          isActiveFarm: poolsStatus[f.chainId]?.[f.lpAddress]?.[0] > 0,
        }
      }
      if (f.protocol === Protocol.V2 || f.protocol === Protocol.STABLE) {
        const currentTimestamp = dayjs().unix()
        return {
          ...f,
          isActiveFarm:
            poolsTimeFrame[f.chainId]?.[f.lpAddress]?.startTimestamp <= currentTimestamp &&
            poolsTimeFrame[f.chainId]?.[f.lpAddress]?.endTimestamp > currentTimestamp,
        }
      }
      return f
    },
  )

  return poolsWithStatus
}

async function fetchMultiChainPoolsFarmingStatus(
  pools: UniversalFarmConfig[],
  isShowTestnet: boolean,
): Promise<Record<string, Record<string, Campaign[]>>> {
  const infinityPools = pools.filter(
    (p) => isInfinityProtocol(p.protocol) && (isShowTestnet || !isTestnetChainId(p.chainId)),
  ) as InfinityPoolInfo[]

  const chainIdToPoolIdsMap = mapValues(groupBy(infinityPools, 'chainId'), (items) => items.map((p) => p.poolId))

  const campaignsByChains = await Promise.allSettled(
    Object.entries(chainIdToPoolIdsMap).map(([chainId, poolIds]) =>
      fetchCampaigns({ chainId: Number(chainId), poolIds, fetchAll: true, includeInactive: false }),
    ),
  )

  return Object.keys(chainIdToPoolIdsMap).reduce((acc, chain, idx) => {
    const resultOfChain = campaignsByChains[idx]
    if (resultOfChain.status === 'fulfilled') {
      const activeCampaigns = resultOfChain.value.filter(
        (camp) =>
          Number(camp.startTime) <= Number(dayjs().unix()) &&
          Number(camp.startTime) + Number(camp.duration) >= Number(dayjs().unix()),
      )
      // eslint-disable-next-line no-param-reassign
      acc[chain] = groupBy(activeCampaigns, 'poolId')
    }
    return acc
  }, {})
}

export const useV3PoolsLength = (chainIds: number[]) => {
  const { data, isPending } = useQuery<{ [key: number]: number }, Error>({
    queryKey: ['useV3PoolsLength', chainIds?.join('-')],
    queryFn: async () => {
      const results = await Promise.all(
        chainIds.map(async (chainId) => {
          const masterChefAddress = masterChefV3Addresses[chainId]
          if (!isAddress(masterChefAddress)) {
            return { chainId, length: 0 }
          }
          const client = publicClient({ chainId })
          try {
            const poolLength = await client.readContract({
              address: masterChefAddress,
              abi: masterChefV3ABI,
              functionName: 'poolLength',
            })
            return { chainId, length: Number(poolLength) }
          } catch (error) {
            console.error(`Error fetching pool length for chainId ${chainId}:`, error)
            return { chainId, length: 0 }
          }
        }),
      )
      return results.reduce((acc, { chainId, length }) => {
        // eslint-disable-next-line no-param-reassign
        acc[chainId] = length
        return acc
      }, {} as { [key: number]: number })
    },
    enabled: chainIds?.length > 0,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: SLOW_INTERVAL,
    staleTime: SLOW_INTERVAL,
  })

  return useMemo(
    () => ({
      data: data ?? {},
      pending: isPending,
    }),
    [data, isPending],
  )
}

export const useV2PoolsLength = (chainIds: number[]) => {
  const { data, isPending } = useQuery<{ [key: number]: number }, Error>({
    queryKey: ['useV2PoolsLength', chainIds?.join('-')],
    queryFn: async () => {
      const results = await Promise.all(
        chainIds.map(async (chainId) => {
          const masterChefAddress = masterChefAddresses[chainId]
          if (!masterChefAddress) {
            return { chainId, length: 0 }
          }
          const client = publicClient({ chainId })
          try {
            const poolLength = await client.readContract({
              address: masterChefAddress,
              abi: masterChefV2ABI,
              functionName: 'poolLength',
            })
            return { chainId, length: Number(poolLength) }
          } catch (error) {
            console.error(`Error fetching pool length for chainId ${chainId}:`, error)
            return { chainId, length: 0 }
          }
        }),
      )
      return results.reduce((acc, { chainId, length }) => {
        // eslint-disable-next-line no-param-reassign
        acc[chainId] = length
        return acc
      }, {} as { [key: number]: number })
    },
    enabled: chainIds?.length > 0,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: SLOW_INTERVAL,
    staleTime: SLOW_INTERVAL,
  })

  return useMemo(
    () => ({
      data: data ?? {},
      pending: isPending,
    }),
    [data, isPending],
  )
}

type IPoolsStatusType = {
  [chainId: number]: {
    [lpAddress: Address]: ArrayItemType<UnwrapPromise<ReturnType<typeof fetchV3PoolsStatusByChainId>>>
  }
}

export const fetchMultiChainV3PoolsStatus = async (pools: UniversalFarmConfig[]): Promise<IPoolsStatusType> => {
  const v3Pools = pools.filter((p) => p.protocol === Protocol.V3)
  const poolsGroupByChains = groupBy(v3Pools, 'chainId')
  const poolsEntries = Object.entries(poolsGroupByChains)

  const results = await Promise.all(
    poolsEntries.map(async ([chainId, poolList]) => {
      if (!poolList.length) return { [chainId]: {} }
      try {
        const poolStatus = await fetchV3PoolsStatusByChainId(Number(chainId), poolList)
        return { [chainId]: keyBy(poolStatus ?? [], ([, lpAddress]) => lpAddress) }
      } catch (error) {
        console.error(`Error fetching pool status for chainId ${chainId}:`, error)
        return { [chainId]: {} }
      }
    }),
  )

  return results.reduce((acc, result) => ({ ...acc, ...result }), {} as IPoolsStatusType)
}

export const useV3PoolStatus = (pool?: PoolInfo | null) => {
  const { data } = useQuery({
    queryKey: ['usePoolStatus', pool?.chainId, pool?.pid, pool?.protocol],
    queryFn: () => {
      return fetchV3PoolsStatusByChainId(pool!.chainId, [pool!])
    },
    enabled: !!pool?.chainId && !!pool?.pid,
    ...QUERY_SETTINGS_IMMUTABLE,
    refetchInterval: SLOW_INTERVAL,
    staleTime: SLOW_INTERVAL,
  })
  return useMemo(() => (data ? data[0] : []), [data])
}

export const usePoolTimeFrame = (bCakeWrapperAddress?: Address, chainId?: number) => {
  const { data } = useQuery({
    queryKey: ['usePoolTimeFrame', bCakeWrapperAddress, chainId],
    queryFn: () => {
      return fetchPoolsTimeFrame([bCakeWrapperAddress!], chainId!)
    },
    enabled: !!chainId && !!bCakeWrapperAddress && bCakeWrapperAddress !== zeroAddress,
    ...QUERY_SETTINGS_IMMUTABLE,
    refetchInterval: SLOW_INTERVAL,
    staleTime: SLOW_INTERVAL,
  })
  return useMemo(
    () =>
      data
        ? data[0]
        : {
            startTimestamp: 0,
            endTimestamp: 0,
          },
    [data],
  )
}

type IPoolsTimeFrameType = {
  [chainId: number]: { [lpAddress: Address]: ArrayItemType<UnwrapPromise<ReturnType<typeof fetchPoolsTimeFrame>>> }
}

async function fetchMultiChainPoolsTimeFrame(pools: UniversalFarmConfig[]): Promise<IPoolsTimeFrameType> {
  const v2Pools = pools.filter((p) => p.protocol === Protocol.V2 || p.protocol === Protocol.STABLE) as Array<
    V2PoolInfo | StablePoolInfo
  >

  const poolsGroupByChains = groupBy(v2Pools, 'chainId')
  const poolsEntries = Object.entries(poolsGroupByChains)

  const results = await Promise.all(
    poolsEntries.map(async ([chainId_, poolList]) => {
      const chainId = Number(chainId_)
      const bCakeAddresses = poolList.map(({ bCakeWrapperAddress }) => bCakeWrapperAddress ?? zeroAddress)
      if (bCakeAddresses.length === 0) return { [chainId]: {} }
      try {
        const timeFrameData = await fetchPoolsTimeFrame(bCakeAddresses, chainId)
        return timeFrameData ?? []
      } catch (error) {
        console.error(`Error fetching time frame data for chainId ${chainId}:`, error)
        return []
      }
    }),
  )

  return results.reduce((acc, result, idx) => {
    let dataIdx = 0
    return Object.assign(acc, {
      [poolsEntries[idx][0]]: keyBy(result, () => poolsEntries[idx][1][dataIdx++].lpAddress),
    })
  }, {} as IPoolsTimeFrameType)
}
