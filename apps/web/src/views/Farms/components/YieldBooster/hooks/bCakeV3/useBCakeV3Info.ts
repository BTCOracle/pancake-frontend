import { keepPreviousData, useQuery } from '@tanstack/react-query'
import BN from 'bignumber.js'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { useMasterchefV3 } from 'hooks/useContract'
import _toNumber from 'lodash/toNumber'
import { PRECISION_FACTOR } from './multiplierAPI'

const QUERY_SETTINGS_WITHOUT_REFETCH = {
  retry: 3,
  retryDelay: 3000,
  placeholderData: keepPreviousData,
}

export const useUserPositionInfo = (tokenId?: string) => {
  const { chainId } = useActiveChainId()
  const masterChefV3 = useMasterchefV3()
  const { data, refetch } = useQuery({
    queryKey: [`v3/masterChef/userPositionInfos/${chainId}/${tokenId}`],
    queryFn: () => masterChefV3?.read.userPositionInfos([BigInt(tokenId ?? 0)]),
    enabled: Boolean(chainId && tokenId),
    ...QUERY_SETTINGS_WITHOUT_REFETCH,
  })

  return {
    data: {
      liquidity: data?.[0],
      boostLiquidity: data?.[1],
      tickLower: data?.[2],
      tickUpper: data?.[3],
      rewardGrowthInside: data?.[4],
      reward: data?.[5],
      user: data?.[6],
      pid: data?.[7],
      boostMultiplier: _toNumber(new BN(data?.[8]?.toString() ?? 0).div(PRECISION_FACTOR).toString()),
    },
    updateUserPositionInfo: refetch,
  }
}
