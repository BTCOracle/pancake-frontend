import noop from 'lodash/noop'
import { PositionDetail } from 'state/farmsV4/state/accountPositions/type'
import { InfinityBinPoolInfo, InfinityCLPoolInfo, PoolInfo } from 'state/farmsV4/state/type'
import {
  useInfinityBinDerivedApr,
  useInfinityCLDerivedApr,
  useV3FormDerivedApr,
} from 'views/universalFarms/hooks/usePositionAPR'

import { PoolAprButtonV3 } from './PoolAprButtonV3'

type PoolPositionAprButtonProps<TPosition, TPoolInfo = PoolInfo> = {
  pool: TPoolInfo
  userPosition: TPosition
  inverted?: boolean
  showApyText?: boolean
  showApyButton?: boolean
  fontSize?: string
}
export const V3PoolDerivedAprButton: React.FC<Omit<PoolPositionAprButtonProps<PositionDetail>, 'userPosition'>> = ({
  pool,
  inverted,
  showApyText,
  showApyButton,
  fontSize,
}) => {
  const { lpApr, cakeApr, merklApr, incentraApr } = useV3FormDerivedApr(pool, inverted)

  return (
    <PoolAprButtonV3
      pool={pool}
      lpApr={lpApr}
      cakeApr={cakeApr}
      merklApr={merklApr}
      incentraApr={incentraApr}
      showApyText={showApyText}
      showApyButton={showApyButton}
      fontSize={fontSize}
    />
  )
}

export const InfinityCLPoolDerivedAprButton: React.FC<{ pool: InfinityCLPoolInfo; fontSize?: string }> = ({
  pool,
  fontSize,
}) => {
  const { lpApr, cakeApr, merklApr, incentraApr } = useInfinityCLDerivedApr(pool)

  return (
    <PoolAprButtonV3
      showApyButton={false}
      pool={pool}
      lpApr={lpApr}
      cakeApr={cakeApr}
      merklApr={merklApr}
      incentraApr={incentraApr}
      onAPRTextClick={noop}
      fontSize={fontSize}
    />
  )
}

export const InfinityBinPoolDerivedAprButton: React.FC<{ pool: InfinityBinPoolInfo; fontSize?: string }> = ({
  pool,
  fontSize,
}) => {
  const { lpApr, cakeApr, merklApr, incentraApr } = useInfinityBinDerivedApr(pool)

  return (
    <PoolAprButtonV3
      showApyButton={false}
      pool={pool}
      lpApr={lpApr}
      cakeApr={cakeApr}
      merklApr={merklApr}
      incentraApr={incentraApr}
      onAPRTextClick={noop}
      fontSize={fontSize}
    />
  )
}
