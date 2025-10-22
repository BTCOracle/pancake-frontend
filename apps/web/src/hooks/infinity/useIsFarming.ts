import { isTestnetChainId } from '@pancakeswap/chains'
import { UniversalFarmConfig } from '@pancakeswap/farms'
import { useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import groupBy from 'lodash/groupBy'
import mapValues from 'lodash/mapValues'
import { useMemo } from 'react'
import { InfinityBinPositionDetail, InfinityCLPositionDetail } from 'state/farmsV4/state/accountPositions/type'
import type { InfinityPoolInfo } from 'state/farmsV4/state/type'
import { useUserShowTestnet } from 'state/user/hooks/useUserShowTestnet'
import { isInfinityProtocol } from 'utils/protocols'
import { Address } from 'viem'

import { fetchCampaigns } from './useCampaigns'

export const useMultiChainPoolsFarmingStatus = (pools: UniversalFarmConfig[]) => {
  const [isShowTestnet] = useUserShowTestnet()

  const infinityPools = useMemo(
    () =>
      pools.filter(
        (p) => isInfinityProtocol(p.protocol) && (isShowTestnet || !isTestnetChainId(p.chainId)),
      ) as InfinityPoolInfo[],
    [pools, isShowTestnet],
  )

  const chainIdToPoolIdsMap = useMemo(() => {
    return mapValues(groupBy(infinityPools, 'chainId'), (items) => items.map((p) => p.poolId))
  }, [infinityPools])

  const { data: campaignsByChains } = useQuery({
    queryKey: ['CampaignsByPoolId', ...infinityPools],
    queryFn: async () =>
      Promise.allSettled(
        Object.entries(chainIdToPoolIdsMap).map(([chainId, poolIds]) =>
          fetchCampaigns({ chainId: Number(chainId), poolIds, fetchAll: true, includeInactive: false }),
        ),
      ),
    enabled: !!infinityPools.length,
    retry: false,
  })

  return useMemo(
    () =>
      campaignsByChains
        ? Object.keys(chainIdToPoolIdsMap).reduce((acc, chain, idx) => {
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
        : {},
    [campaignsByChains, chainIdToPoolIdsMap],
  )
}

export const usePositionIsFarming = ({ chainId, poolId }: { chainId?: number; poolId?: string }) => {
  const { data: campaignsByPoolId } = useQuery({
    queryKey: ['CampaignsByPoolId', poolId, chainId],
    queryFn: async () =>
      fetchCampaigns({ chainId: Number(chainId), poolIds: [poolId!], fetchAll: true, includeInactive: false }),
    enabled: !!poolId,
    retry: false,
  })
  return useMemo(
    () =>
      campaignsByPoolId?.some(
        (camp) =>
          camp.poolId === poolId &&
          Number(camp.startTime) <= Number(dayjs().unix()) &&
          Number(camp.startTime) + Number(camp.duration) >= Number(dayjs().unix()),
      ),
    [campaignsByPoolId, poolId],
  )
}

export const usePositionsWithFarming = <T extends InfinityBinPositionDetail | InfinityCLPositionDetail>({
  positions,
}: {
  positions?: T[]
}) => {
  const pools = useMemo(
    () =>
      positions?.map(
        (p) =>
          ({
            chainId: p.chainId,
            protocol: p.protocol,
            poolId: p.poolId,
          } as UniversalFarmConfig),
      ) ?? [],
    [positions],
  )
  const infinityPoolsFarmingStatus = useMultiChainPoolsFarmingStatus(pools)
  return useMemo(
    () =>
      infinityPoolsFarmingStatus
        ? positions?.map((pos) => {
            if (!(isInfinityProtocol(pos.protocol) && infinityPoolsFarmingStatus[pos.chainId]?.[pos.poolId])) {
              return pos
            }
            return {
              ...pos,
              isStaked: !!infinityPoolsFarmingStatus[pos.chainId]?.[pos.poolId],
            }
          })
        : positions,
    [positions, infinityPoolsFarmingStatus],
  )
}
