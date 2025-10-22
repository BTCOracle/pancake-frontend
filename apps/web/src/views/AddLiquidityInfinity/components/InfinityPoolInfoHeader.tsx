import { Protocol } from '@pancakeswap/farms'
import { useMatchBreakpoints } from '@pancakeswap/uikit'
import { PoolInfoHeader } from 'components/PoolInfoHeader'
import { useInfinityPoolIdRouteParams } from 'hooks/dynamicRoute/usePoolIdRoute'
import { useCurrencyByPoolId } from 'hooks/infinity/useCurrencyByPoolId'
import { useHookByPoolId } from 'hooks/infinity/useHooksList'
import { useMemo } from 'react'
import { usePoolInfo } from 'state/farmsV4/hooks'
import { useInverted } from 'state/infinity/shared'
import { getTokenSymbolAlias } from 'utils/getTokenAlias'
import {
  InfinityBinPoolDerivedAprButton,
  InfinityCLPoolDerivedAprButton,
} from 'views/universalFarms/components/PoolAprButtonV3/PoolPositionAprButtonV3'

export const InfinityPoolInfoHeader = () => {
  const { chainId, poolId } = useInfinityPoolIdRouteParams()
  const { isMobile } = useMatchBreakpoints()
  const poolInfo = usePoolInfo({ poolAddress: poolId, chainId })
  const hookData = useHookByPoolId(chainId, poolId)
  const { currency0, currency1 } = useCurrencyByPoolId({ chainId, poolId })

  const [inverted, setInverted] = useInverted()

  const symbol0 = useMemo(
    () => getTokenSymbolAlias(currency0?.wrapped?.address, currency0?.chainId, currency0?.symbol),
    [currency0],
  )
  const symbol1 = useMemo(
    () => getTokenSymbolAlias(currency1?.wrapped?.address, currency1?.chainId, currency1?.symbol),
    [currency1],
  )

  return (
    <PoolInfoHeader
      poolId={poolId}
      poolInfo={poolInfo}
      currency0={currency0}
      currency1={currency1}
      symbol0={symbol0}
      symbol1={symbol1}
      chainId={chainId}
      isInverted={Boolean(inverted)}
      onInvertPrices={() => setInverted(!inverted)}
      hookData={hookData}
      linkType="addLiquidity"
      overrideAprDisplay={{
        aprDisplay: poolInfo ? (
          poolInfo.protocol === Protocol.InfinityCLAMM ? (
            <InfinityCLPoolDerivedAprButton pool={poolInfo} fontSize={isMobile ? '20px' : '24px'} />
          ) : poolInfo.protocol === Protocol.InfinityBIN ? (
            <InfinityBinPoolDerivedAprButton pool={poolInfo} fontSize={isMobile ? '20px' : '24px'} />
          ) : (
            '-'
          )
        ) : null,
        roiCalculator: <></>,
      }}
    />
  )
}
