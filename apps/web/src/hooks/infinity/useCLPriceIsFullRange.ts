import { useMemo } from 'react'
import { useClRangeQueryState } from 'state/infinity/shared'
import { useTicksLimit } from 'views/AddLiquidityInfinity/hooks/useTicksAtLimit'

export const useCLPriceIsFullRange = ({ tickSpacing }: { tickSpacing: number | undefined }) => {
  const [{ lowerTick, upperTick }] = useClRangeQueryState()
  const ticksAtLimit = useTicksLimit(tickSpacing)

  return useMemo(() => {
    if (lowerTick === null || upperTick === null) return false
    if (ticksAtLimit) {
      return lowerTick === ticksAtLimit.LOWER && upperTick === ticksAtLimit.UPPER
    }
    return false
  }, [lowerTick, upperTick, ticksAtLimit])
}
