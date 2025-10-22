import { ALL_PROTOCOLS, Protocol } from '@pancakeswap/farms'
import { INetworkProps, ITokenProps, toTokenValue } from '@pancakeswap/widgets-internal'
import intersection from 'lodash/intersection'
import { useCallback, useMemo } from 'react'
import { useAccountInfinityBinPositions, useAccountInfinityCLPositions } from 'state/farmsV4/hooks'
import {
  InfinityBinPositionDetail,
  InfinityCLPositionDetail,
  POSITION_STATUS,
} from 'state/farmsV4/state/accountPositions/type'
import { getHookByAddress } from 'utils/getHookByAddress'
import { isInfinityProtocol } from 'utils/protocols'
import { usePoolFeatureAndType } from 'views/AddLiquiditySelector/hooks/usePoolTypeQuery'
import { useAccount } from 'wagmi'
import { useAllEvmChainIds } from './useMultiChains'
import { usePositionEarningAmount } from './usePositionEarningAmount'

type InfinityPositionsParams = {
  selectedNetwork: INetworkProps['value']
  selectedTokens: ITokenProps['value']
  positionStatus: POSITION_STATUS
  farmsOnly: boolean
}

export const useInfinityPositions = ({
  selectedNetwork,
  selectedTokens,
  positionStatus,
  farmsOnly,
}: InfinityPositionsParams) => {
  const { data: allPositions, isLoading } = useInfinityPositionsData()
  const { protocols, isSelectAllProtocols, isSelectAllFeatures, features } = usePoolFeatureAndType()
  const infinityTypes = useMemo(
    () => (isSelectAllProtocols || !protocols.length ? ALL_PROTOCOLS : protocols),
    [protocols, isSelectAllProtocols],
  )
  const [positionEarningAmount] = usePositionEarningAmount()

  const isExhausted = useCallback(
    (pos: InfinityCLPositionDetail | InfinityBinPositionDetail) => {
      if (pos.liquidity > 0n) {
        return false
      }
      const reward = positionEarningAmount?.[pos.chainId]?.[pos.poolId]
      if (!reward) {
        return false
      }

      if (pos.protocol === Protocol.InfinityCLAMM) return false

      return !(reward ?? true)
    },
    [positionEarningAmount],
  )

  const filteredPositions = useMemo(
    () =>
      allPositions.filter(
        (pos) =>
          infinityTypes.includes(pos.protocol) &&
          selectedNetwork.includes(pos.chainId) &&
          (!selectedTokens?.length ||
            selectedTokens.some(
              (token) =>
                (pos.poolKey?.currency0 &&
                  token === toTokenValue({ chainId: pos.chainId, address: pos.poolKey.currency0 })) ||
                (pos.poolKey?.currency1 &&
                  token === toTokenValue({ chainId: pos.chainId, address: pos.poolKey.currency1 })),
            )) &&
          (positionStatus === POSITION_STATUS.ALL || pos.status === positionStatus) &&
          (!farmsOnly || pos.isStaked) &&
          (isSelectAllFeatures ||
            !features.length ||
            (isInfinityProtocol(pos.protocol) &&
              pos.poolKey?.hooks &&
              intersection(features, getHookByAddress(pos.chainId, pos.poolKey.hooks)?.category).length)) &&
          !isExhausted(pos),
      ),
    [
      allPositions,
      infinityTypes,
      selectedNetwork,
      selectedTokens,
      positionStatus,
      farmsOnly,
      features,
      isSelectAllFeatures,
      isExhausted,
    ],
  )

  const sortedPositions = useMemo(() => filteredPositions.sort((a, b) => a.status - b.status), [filteredPositions])

  return {
    infinityLoading: isLoading,
    infinityPositions: sortedPositions,
    allInfinityPositions: allPositions,
  }
}

export const useInfinityPositionsData = () => {
  const { address: account } = useAccount()
  const allChainIds = useAllEvmChainIds()
  const { data: infinityCLPositions, pending: infinityCLLoading } = useAccountInfinityCLPositions(allChainIds, account)
  const { data: infinityBinPositions, pending: infinityBinLoading } = useAccountInfinityBinPositions(
    account,
    allChainIds,
  )

  const positions = useMemo(
    () =>
      ([] as Array<InfinityCLPositionDetail | InfinityBinPositionDetail>).concat(
        infinityCLPositions ?? [],
        infinityBinPositions ?? [],
      ),
    [infinityCLPositions, infinityBinPositions],
  )

  return {
    isLoading: infinityCLLoading || infinityBinLoading,
    data: positions,
  }
}
