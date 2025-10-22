import { useQueries, useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query'
import { QUERY_SETTINGS_IMMUTABLE, SLOW_INTERVAL } from 'config/constants'
import { usePositionsWithFarming } from 'hooks/infinity/useIsFarming'
import { useCallback, useMemo } from 'react'
import { useUserAddedTokensByChainIds } from 'state/user/hooks/useUserAddedTokens'
import { Address, Hex } from 'viem'
import { getAccountInfinityBinPositionByPoolId } from '../fetcher/infinity/getAccountInfinityBinPositionByPoolId'
import { getAccountInfinityBinPositionsWithFallback } from '../fetcher/infinity/getAccountInfinityBinPositions'
import { InfinityBinPositionDetail } from '../type'
import { useLatestTxReceipt } from './useLatestTxReceipt'

export const useAccountInfinityBinPositions = (account: Address | undefined, chainIds: number[]) => {
  const [latestTxReceipt] = useLatestTxReceipt()
  const userAddedTokens = useUserAddedTokensByChainIds(chainIds)
  const queries = useMemo(() => {
    return chainIds.map((chainId) => {
      return {
        queryKey: ['account-all-infinity-bin-position', chainId, account, latestTxReceipt?.blockHash],
        queryFn: () => getAccountInfinityBinPositionsWithFallback(chainId, account!, userAddedTokens[chainId]),
        enabled: !!account && !!chainId,
        staleTime: SLOW_INTERVAL,
        refetchInterval: SLOW_INTERVAL,
        ...QUERY_SETTINGS_IMMUTABLE,
      } satisfies UseQueryOptions<InfinityBinPositionDetail[]>
    })
  }, [chainIds, account, latestTxReceipt?.blockHash, userAddedTokens])

  const combine = useCallback((results: UseQueryResult<InfinityBinPositionDetail[], Error>[]) => {
    return {
      data: results.reduce((acc, result) => acc.concat(result.data ?? []), [] as InfinityBinPositionDetail[]),
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

export const useAccountInfinityBinPosition = (
  account: Address | undefined,
  poolId: Hex | undefined,
  chainId: number,
) => {
  const [latestTxReceipt] = useLatestTxReceipt()

  const { data, isPending } = useQuery({
    queryKey: ['account-infinity-bin-positions-with-farming', poolId, account, chainId, latestTxReceipt?.blockHash],
    queryFn: () =>
      getAccountInfinityBinPositionByPoolId({
        chainId,
        poolId: poolId!,
        account: account!,
      }),
    enabled: !!account && !!chainId && !!poolId,
    staleTime: SLOW_INTERVAL,
    refetchInterval: SLOW_INTERVAL,
  })

  const dataWithFarming = usePositionsWithFarming({ positions: data ? [data] : undefined })
  return {
    data: (dataWithFarming ? dataWithFarming[0] : undefined) as InfinityBinPositionDetail | undefined,
    isPending,
  }
}
