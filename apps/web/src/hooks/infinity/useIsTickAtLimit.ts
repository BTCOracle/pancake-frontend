import { nearestUsableTick, TickMath } from '@pancakeswap/v3-sdk'
import { Bound } from 'config/constants/types'
import { useMemo } from 'react'

export default function useIsTickAtLimit(
  tickLower: number | undefined,
  tickUpper: number | undefined,
  tickSpacing: number | undefined,
) {
  const ticksLimit: {
    [bound in Bound]: number | undefined
  } = useMemo(
    () => ({
      [Bound.LOWER]: tickSpacing ? nearestUsableTick(TickMath.MIN_TICK, tickSpacing) : undefined,
      [Bound.UPPER]: tickSpacing ? nearestUsableTick(TickMath.MAX_TICK, tickSpacing) : undefined,
    }),
    [tickSpacing],
  )
  return useMemo(
    () => ({
      [Bound.LOWER]: tickLower && ticksLimit.LOWER ? tickLower <= ticksLimit.LOWER : false,
      [Bound.UPPER]: tickUpper && ticksLimit.UPPER ? tickUpper >= ticksLimit.UPPER : false,
    }),
    [ticksLimit, tickLower, tickUpper],
  )
}
