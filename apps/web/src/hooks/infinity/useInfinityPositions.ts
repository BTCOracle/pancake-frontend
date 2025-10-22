import { useQuery } from '@tanstack/react-query'
import { SLOW_INTERVAL } from 'config/constants'
import { readCLPositions } from 'state/farmsV4/state/accountPositions/fetcher/infinity'
import { getAccountInfinityBinPositionByPoolId } from 'state/farmsV4/state/accountPositions/fetcher/infinity/getAccountInfinityBinPositionByPoolId'
import { useLatestTxReceipt } from 'state/farmsV4/state/accountPositions/hooks/useLatestTxReceipt'
import { Address, type Hex } from 'viem'

export function useInfinityClPositionFromTokenId(tokenId_: bigint | number | undefined, chainId: number | undefined) {
  const tokenId = Number(tokenId_)
  const [latestTxReceipt] = useLatestTxReceipt()
  const { data, isLoading } = useQuery({
    queryKey: ['useInfinityPositionFromTokenId', tokenId, chainId, latestTxReceipt?.blockHash],
    queryFn: () => readCLPositions(chainId!, tokenId ? [tokenId] : []),
    enabled: Boolean(chainId && tokenId),
    staleTime: SLOW_INTERVAL,
    refetchInterval: SLOW_INTERVAL,
    placeholderData: (prev) => prev,
  })
  return {
    isLoading,
    position: data?.[0],
  }
}

export function useInfinityBinPosition(poolId: Hex | undefined, chainId: number, account: Address | undefined) {
  const [latestTxReceipt] = useLatestTxReceipt()

  return useQuery({
    queryKey: ['account-infinity-bin-position', poolId, account, chainId, latestTxReceipt?.blockHash],
    queryFn: () =>
      getAccountInfinityBinPositionByPoolId({
        chainId,
        poolId: poolId!,
        account: account!,
      }).then((position) => position ?? null),
    enabled: !!poolId && !!account && !!chainId,
    staleTime: SLOW_INTERVAL,
    refetchInterval: SLOW_INTERVAL,
    placeholderData: (prev) => prev,
  })
}
