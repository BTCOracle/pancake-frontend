import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { isAddressEqual } from 'utils'

export const INCENTRA_API = 'https://incentra-prd.brevis.network/sdk/v1'

export type IncentraCampaign = {
  chainId: string
  campaignType: string
  pools: {
    poolId: string
    poolName: string
  }
  campaignId: string
  campaignName: string
  startTime: string
  endTime: string
  rewardInfo: {
    apr: number
    tokenAddress: string
    tokenSymbol: string
  }
  status: string
}

export function useIncentraInfo(poolAddress?: string): {
  isPending: boolean
  hasIncentra: boolean
  incentraApr?: number
  refreshData: () => void
} {
  const { data, isPending, refetch } = useQuery({
    queryKey: ['fetchIncentraPools'],
    queryFn: async () => {
      const res = await fetch(`${INCENTRA_API}/liquidityCampaigns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaign_type: [3, 4], // PancakeSwap campaigns
          status: [4], // ACTIVE
        }),
      })

      if (!res.ok) {
        throw new Error('Failed to fetch Incentra campaigns')
      }

      const json = await res.json()

      if (json.err) {
        throw new Error(`Incentra API error: ${json.err}`)
      }

      return json?.campaigns as IncentraCampaign[]
    },
    enabled: Boolean(poolAddress),
    staleTime: Infinity,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  })

  return useMemo(() => {
    if (!data || !poolAddress) {
      return {
        isPending,
        hasIncentra: false,
        incentraApr: undefined,
        refreshData: refetch,
      }
    }

    const campaign = data.find((c) => isAddressEqual(c.pools.poolId, poolAddress))

    return {
      isPending,
      hasIncentra: Boolean(campaign),
      incentraApr: campaign?.rewardInfo?.apr,
      refreshData: refetch,
    }
  }, [data, poolAddress, isPending, refetch])
}
