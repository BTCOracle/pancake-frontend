import { ChainId } from '@pancakeswap/chains'
import { memoizeAsync } from '@pancakeswap/utils/memoize'
import { useQueries, useQuery } from '@tanstack/react-query'
import { QUERY_SETTINGS_IMMUTABLE } from 'config/constants'
import groupBy from 'lodash/groupBy'
import { useMemo } from 'react'
import { rewardApiClient } from 'state/farmsV4/api/client'
import { operations } from 'state/farmsV4/api/schema'
import { getHashKey } from 'utils/hash'
import { Address } from 'viem'

interface FetchCampaignsProps {
  chainId?: number
  poolIds?: string[]
  includeInactive?: boolean
  page?: number
  fetchAll?: boolean
  result?: operations['getCampaignsByPoolId']['responses']['200']['content']['application/json']['campaigns']
}

export const fetchCampaigns = memoizeAsync(
  async ({
    chainId,
    includeInactive = true,
    poolIds,
    page = 1,
    fetchAll = false,
    result = [],
  }: FetchCampaignsProps) => {
    if (!chainId) {
      return []
    }

    const { data } = await rewardApiClient.GET('/farms/campaigns/{chainId}/{includeInactive}', {
      baseUrl:
        chainId === ChainId.BSC_TESTNET ? 'https://test.v4.pancakeswap.com/' : 'https://infinity.pancakeswap.com/',
      params: {
        path: { chainId, includeInactive },
        query: {
          poolIds: poolIds ?? [], // API will just ignore if not relevant
          limit: 100,
          page,
        },
      },
    })

    if (data?.campaigns) {
      result.push(...data.campaigns)
    }

    if (fetchAll && data && data.totalRecords > result.length) {
      return fetchCampaigns({
        chainId,
        includeInactive,
        poolIds,
        page: page + 1,
        fetchAll,
        result,
      })
    }

    return result
  },
  {
    resolver: (args: FetchCampaignsProps) => {
      return getHashKey(args)
    },
  },
)

export const fetchAllCampaignsByChainId = async ({ chainId, includeInactive = true }: FetchCampaignsProps) => {
  if (!chainId) {
    return []
  }
  return fetchCampaigns({ chainId, includeInactive, page: 1, fetchAll: true })
}

export const useCampaignsByChainId = ({ chainId, includeInactive = false }: FetchCampaignsProps) => {
  const { data } = useQuery({
    queryKey: ['campaignsByChainId', chainId, includeInactive],
    queryFn: () => fetchAllCampaignsByChainId({ chainId, includeInactive }),
    enabled: !!chainId,
    retry: false,
    ...QUERY_SETTINGS_IMMUTABLE,
  })

  return data
}

type CampaignsAccumulator = {
  [chainId: number]: Record<Address, Awaited<ReturnType<typeof fetchCampaigns>>>
}

export const useCampaignsByChainIds = ({
  chainIds,
  includeInactive = false,
}: {
  chainIds: number[]
  includeInactive?: boolean
}) => {
  const queries = useMemo(
    () =>
      chainIds.map((chainId) => ({
        queryKey: ['campaignsByChainId', chainId, includeInactive],
        queryFn: () => fetchCampaigns({ chainId, includeInactive }),
        enabled: !!chainId,
        retry: false,
        ...QUERY_SETTINGS_IMMUTABLE,
      })),
    [chainIds, includeInactive],
  )
  return useQueries({
    queries,
    combine(result) {
      return chainIds.reduce<CampaignsAccumulator>((acc, chainId, idx) => {
        const currentResult = result[idx]?.data
        if (Array.isArray(currentResult)) {
          // eslint-disable-next-line no-param-reassign
          acc[chainId] = groupBy(currentResult, 'poolId')
        } else {
          // eslint-disable-next-line no-param-reassign
          acc[chainId] = acc[chainId] ?? {}
        }
        return acc
      }, {} as CampaignsAccumulator)
    },
  })
}
