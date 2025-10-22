import { UnifiedCurrency } from '@pancakeswap/sdk'
import { TickUtils } from '@pancakeswap/solana-core-sdk'
import { useClmmAmmConfigs } from 'hooks/solana/useClmmAmmConfigs'
import { tryParsePriceSolana } from 'hooks/v3/utils/tryParsePriceSolana'
import { useCallback, useMemo } from 'react'
import { setFullRange } from 'views/AddLiquidityV3/formViews/V3FormView/form/actions'
import { useV3FormDispatch } from 'views/AddLiquidityV3/formViews/V3FormView/form/reducer'

export function useSolanaRangeHopCallbacks(
  baseCurrency: UnifiedCurrency | undefined,
  quoteCurrency: UnifiedCurrency | undefined,
  feeAmount: number | undefined | null,
  tickLower: number | undefined,
  tickUpper: number | undefined,
  pool?: { tickCurrent: number } | undefined | null,
) {
  const dispatch = useV3FormDispatch()
  const ammConfigs = useClmmAmmConfigs()

  const baseToken = useMemo(() => baseCurrency?.wrapped, [baseCurrency])
  const quoteToken = useMemo(() => quoteCurrency?.wrapped, [quoteCurrency])

  const effectiveTickSpacing = useMemo(() => {
    return Object.values(ammConfigs).find((c) => c.tradeFeeRate === Number(feeAmount))?.tickSpacing ?? undefined
  }, [ammConfigs, feeAmount])

  const getDecrementLower = useCallback(() => {
    if (baseToken && quoteToken && typeof tickLower === 'number' && effectiveTickSpacing !== undefined) {
      return tryParsePriceSolana({
        tickSpacing: effectiveTickSpacing,
        tick: TickUtils.nearestUsableTick(tickLower - effectiveTickSpacing, effectiveTickSpacing),
        token0: baseToken,
        token1: quoteToken,
        baseIn: true,
      })
    }
    // use pool current tick as starting tick if we have pool but no tick input
    if (!(typeof tickLower === 'number') && baseToken && quoteToken && effectiveTickSpacing !== undefined && pool) {
      return tryParsePriceSolana({
        tickSpacing: effectiveTickSpacing,
        tick: TickUtils.nearestUsableTick(pool.tickCurrent - effectiveTickSpacing, effectiveTickSpacing),
        token0: baseToken,
        token1: quoteToken,
        baseIn: true,
      })
    }
    return undefined
  }, [baseToken, quoteToken, tickLower, effectiveTickSpacing, pool])

  const getIncrementLower = useCallback(() => {
    if (baseToken && quoteToken && typeof tickLower === 'number' && effectiveTickSpacing !== undefined) {
      return tryParsePriceSolana({
        tickSpacing: effectiveTickSpacing,
        tick: TickUtils.nearestUsableTick(tickLower + effectiveTickSpacing, effectiveTickSpacing),
        token0: baseToken,
        token1: quoteToken,
        baseIn: true,
      })
    }
    // use pool current tick as starting tick if we have pool but no tick input
    if (!(typeof tickLower === 'number') && baseToken && quoteToken && effectiveTickSpacing !== undefined && pool) {
      return tryParsePriceSolana({
        tickSpacing: effectiveTickSpacing,
        tick: TickUtils.nearestUsableTick(pool.tickCurrent + effectiveTickSpacing, effectiveTickSpacing),
        token0: baseToken,
        token1: quoteToken,
        baseIn: true,
      })
    }
    return undefined
  }, [baseToken, quoteToken, tickLower, effectiveTickSpacing, pool])

  const getDecrementUpper = useCallback(() => {
    if (baseToken && quoteToken && typeof tickUpper === 'number' && effectiveTickSpacing !== undefined) {
      return tryParsePriceSolana({
        tickSpacing: effectiveTickSpacing,
        tick: TickUtils.nearestUsableTick(tickUpper - effectiveTickSpacing, effectiveTickSpacing),
        token0: baseToken,
        token1: quoteToken,
        baseIn: true,
      })
    }
    // use pool current tick as starting tick if we have pool but no tick input
    if (!(typeof tickUpper === 'number') && baseToken && quoteToken && effectiveTickSpacing !== undefined && pool) {
      return tryParsePriceSolana({
        tickSpacing: effectiveTickSpacing,
        tick: TickUtils.nearestUsableTick(pool.tickCurrent - effectiveTickSpacing, effectiveTickSpacing),
        token0: baseToken,
        token1: quoteToken,
        baseIn: true,
      })
    }
    return undefined
  }, [baseToken, quoteToken, tickUpper, effectiveTickSpacing, pool])

  const getIncrementUpper = useCallback(() => {
    if (baseToken && quoteToken && typeof tickUpper === 'number' && effectiveTickSpacing !== undefined) {
      return tryParsePriceSolana({
        tickSpacing: effectiveTickSpacing,
        tick: TickUtils.nearestUsableTick(tickUpper + effectiveTickSpacing, effectiveTickSpacing),
        token0: baseToken,
        token1: quoteToken,
        baseIn: true,
      })
    }
    // use pool current tick as starting tick if we have pool but no tick input
    if (!(typeof tickUpper === 'number') && baseToken && quoteToken && effectiveTickSpacing !== undefined && pool) {
      return tryParsePriceSolana({
        tickSpacing: effectiveTickSpacing,
        tick: TickUtils.nearestUsableTick(pool.tickCurrent + effectiveTickSpacing, effectiveTickSpacing),
        token0: baseToken,
        token1: quoteToken,
        baseIn: true,
      })
    }
    return undefined
  }, [baseToken, quoteToken, tickUpper, effectiveTickSpacing, pool])

  const getSetFullRange = useCallback(() => {
    dispatch(setFullRange())
  }, [dispatch])

  return { getDecrementLower, getIncrementLower, getDecrementUpper, getIncrementUpper, getSetFullRange }
}
