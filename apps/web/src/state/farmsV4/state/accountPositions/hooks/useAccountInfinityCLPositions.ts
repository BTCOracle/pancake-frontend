import { useQueries, UseQueryOptions, UseQueryResult } from '@tanstack/react-query'
import { QUERY_SETTINGS_IMMUTABLE, SLOW_INTERVAL } from 'config/constants'
import { usePositionsWithFarming } from 'hooks/infinity/useIsFarming'
import { useCallback, useMemo } from 'react'
import { Address } from 'viem'

import { getAccountInfinityCLPositionsWithFallback } from '../fetcher/infinity'
import { InfinityCLPositionDetail } from '../type'
import { useLatestTxReceipt } from './useLatestTxReceipt'

export const useAccountInfinityCLPositions = (chainIds: number[], account?: Address | null) => {
  const [latestTxReceipt] = useLatestTxReceipt()
  const queries = useMemo(() => {
    return chainIds.map((chainId) => {
      return {
        queryKey: ['account-infinity-positions', account, chainId, latestTxReceipt?.blockHash],
        queryFn: () => getAccountInfinityCLPositionsWithFallback(chainId, account!),
        enabled: !!account && !!chainId,
        staleTime: SLOW_INTERVAL,
        refetchInterval: SLOW_INTERVAL,
        ...QUERY_SETTINGS_IMMUTABLE,
      } satisfies UseQueryOptions<InfinityCLPositionDetail[]>
    })
  }, [account, chainIds, latestTxReceipt?.blockHash])

  const combine = useCallback((results: UseQueryResult<InfinityCLPositionDetail[], Error>[]) => {
    return {
      data: results.reduce((acc, result) => acc.concat(result.data ?? []), [] as InfinityCLPositionDetail[]),
      pending: results.some((result) => result.isPending),
    }
  }, [])
  const { data, pending } = useQueries({
    queries,
    combine,
  })
  const dataWithFarming = usePositionsWithFarming({ positions: data })
  return {
    data: dataWithFarming,
    pending: !account ? false : pending,
  }
}
