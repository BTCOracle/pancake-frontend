import { nearestUsableTick, TickMath } from '@pancakeswap/v3-sdk'
import { Bound } from 'config/constants/types'
import { useMemo } from 'react'
import { useClRangeQueryState } from 'state/infinity/shared'

export const useTicksLimit = (tickSpacing: number | undefined) => {
  return useMemo(() => {
    if (!tickSpacing) return { [Bound.LOWER]: undefined, [Bound.UPPER]: undefined }
    return {
      [Bound.LOWER]: nearestUsableTick(TickMath.MIN_TICK, tickSpacing),
      [Bound.UPPER]: nearestUsableTick(TickMath.MAX_TICK, tickSpacing),
    }
  }, [tickSpacing])
}

export const useTicksAtLimit = (tickSpacing: number | undefined) => {
  const [{ lowerTick, upperTick }] = useClRangeQueryState()

  const ticksLimits = useTicksLimit(tickSpacing)

  return useMemo(() => {
    return {
      [Bound.LOWER]:
        lowerTick !== null && ticksLimits[Bound.LOWER] !== undefined && lowerTick <= ticksLimits[Bound.LOWER],
      [Bound.UPPER]:
        upperTick !== null && ticksLimits[Bound.UPPER] !== undefined && upperTick >= ticksLimits[Bound.UPPER],
    }
  }, [lowerTick, upperTick, ticksLimits])
}
