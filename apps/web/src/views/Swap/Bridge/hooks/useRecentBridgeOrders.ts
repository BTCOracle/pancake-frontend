import { useInfiniteQuery } from '@tanstack/react-query'
import { createQueryKey } from 'utils/reactQuery'
import { Address } from 'viem/accounts'
import { useExperimentalFeatureEnabled } from 'hooks/useExperimentalFeatureEnabled'
import { EXPERIMENTAL_FEATURES } from 'config/experimentalFeatures'
import { getUserBridgeOrders, getUserBridgeOrdersV2 } from '../api'
import { BridgeStatus } from '../types'

const getRecentBridgeOrdersQueryKey = createQueryKey<'recent-bridge-orders', [address: string]>('recent-bridge-orders')

interface UseRecentBridgeOrdersParameters {
  address?: string
}

export const useRecentBridgeOrders = ({ address }: UseRecentBridgeOrdersParameters) => {
  const isBridgeV2Enabled = useExperimentalFeatureEnabled(EXPERIMENTAL_FEATURES.BRIDGE_V2)
  return useInfiniteQuery({
    queryKey: getRecentBridgeOrdersQueryKey([address!]),
    queryFn: async ({ pageParam }) => {
      if (!address) {
        throw new Error("No address provided for user's bridge orders")
      }

      if (!isBridgeV2Enabled) {
        return getUserBridgeOrders(address as Address, pageParam)
      }

      const responsev2 = await getUserBridgeOrdersV2(address, pageParam)

      const mergedRows = [...responsev2.EVM.rows, ...responsev2['NON-EVM'].rows].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      )
      return {
        endCursor: responsev2.EVM.endCursor,
        continuation: responsev2['NON-EVM'].endCursor,
        hasNextPage: responsev2.EVM.hasNextPage || responsev2['NON-EVM'].hasNextPage,
        rows: mergedRows,
      }
    },
    enabled: !!address,
    initialPageParam: undefined,
    getNextPageParam: (lastPage: any) => {
      return {
        after: lastPage.endCursor as string,
        continuation: lastPage.continuation as string,
      }
    },
    retry: 3,
    retryDelay: 1_000,
    refetchOnMount: true,
    refetchInterval: (query) =>
      query.state.data?.pages
        .flatMap((page) => (Array.isArray(page.rows) ? page.rows.map((row) => row.status) : []))
        .find((status) => status === BridgeStatus.PENDING || status === BridgeStatus.BRIDGE_PENDING)
        ? 20_000
        : 60_000,
  })
}
