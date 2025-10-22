import { HOOK_CATEGORY, HookData } from '@pancakeswap/infinity-sdk'
import { useTranslation } from '@pancakeswap/localization'
import { Percent } from '@pancakeswap/sdk'
import { Flex, InfoIcon, Text, useModal } from '@pancakeswap/uikit'
import { FeeTierTooltip, Liquidity } from '@pancakeswap/widgets-internal'
import { InfinityFeeTier, InfinityFeeTierPoolParams, useInfinityFeeTier } from 'hooks/infinity/useInfinityFeeTier'
import { usePoolById } from 'hooks/infinity/usePool'
import { useCallback, useMemo } from 'react'
import { getPoolInfoForInfiFee } from 'state/farmsV4/search/farm.util'
import { PoolInfo } from 'state/farmsV4/state/type'
import { Address } from 'viem'

interface FeeTierBreakdownProps {
  poolId?: Address
  chainId?: number
  hookData?: HookData
  poolInfo?: PoolInfo
  infoIconVisible?: boolean
  showType?: boolean
}
export const InfinityFeeTierBreakdown = ({
  poolId,
  chainId,
  hookData,
  infoIconVisible = true,
  poolInfo,
  showType = true,
}: FeeTierBreakdownProps) => {
  const enabled = !poolInfo?.farm

  const [, pool] = usePoolById(poolId, chainId, enabled)
  const farm = poolInfo?.farm

  const info = farm ? getPoolInfoForInfiFee(farm) : pool
  if (!info) {
    return null
  }
  return (
    <InfinityFeeTierBreakdownDisplay
      pool={info!}
      poolId={poolId}
      chainId={chainId}
      hookData={hookData}
      infoIconVisible={infoIconVisible}
      showType={showType}
    />
  )
}

export const InfinityFeeTierBreakdownDisplay = ({
  pool,
  showType = true,
  hookData,
  infoIconVisible = true,
}: FeeTierBreakdownProps & {
  pool: InfinityFeeTierPoolParams
  showType?: boolean
}) => {
  const infinityFeeTier = useInfinityFeeTier(pool)
  const [onPresentHookDetailModal] = useModal(<Liquidity.HookModal hookData={hookData} />)
  const handleInfoIconClick = useCallback(
    (e) => {
      e.stopPropagation()
      e.preventDefault()
      onPresentHookDetailModal()
    },
    [onPresentHookDetailModal],
  )

  const tooltips = useMemo(() => {
    return <FeeTierTooltips infinityFeeTier={infinityFeeTier} hookData={hookData} />
  }, [infinityFeeTier, hookData])

  if (!pool) {
    return null
  }

  return (
    <Flex alignItems="center">
      <FeeTierTooltip
        tooltips={tooltips}
        dynamic={pool?.dynamic}
        type={infinityFeeTier.type}
        percent={infinityFeeTier.percent}
        showType={showType}
      />
      {hookData?.category?.includes(HOOK_CATEGORY.DynamicFees) && infoIconVisible ? (
        <InfoIcon
          color="textSubtle"
          width={18}
          height={18}
          ml="4px"
          onClick={handleInfoIconClick}
          style={{ cursor: 'pointer' }}
        />
      ) : null}
    </Flex>
  )
}

export const FeeTierTooltips: React.FC<{
  infinityFeeTier: InfinityFeeTier
  hookData?: HookData
}> = ({ infinityFeeTier, hookData }) => {
  const { t } = useTranslation()
  const { protocol, lpFee, protocolFee } = infinityFeeTier

  return (
    <>
      <Text bold> {t('%t% LP', { t: protocol.toUpperCase() })}</Text>
      <Text>
        {' '}
        -{' '}
        {t('%p%% LP Fee', {
          p: (lpFee.equalTo(0) ? new Percent(hookData?.defaultFee ?? 0, 1e6) : lpFee).toSignificant(2),
        })}
      </Text>
      <Text> - {t('%p%% Protocol Fee', { p: protocolFee.toSignificant(2) })}</Text>
    </>
  )
}
