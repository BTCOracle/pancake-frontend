import { getPoolId } from '@pancakeswap/infinity-sdk'
import { useCurrencyByChainId } from 'hooks/Tokens'
import useIsTickAtLimit from 'hooks/infinity/useIsTickAtLimit'
import { usePoolById } from 'hooks/infinity/usePool'
import { usePositionAmount } from 'hooks/infinity/usePositionAmount'
import { useMemo } from 'react'
import isUndefinedOrNull from '@pancakeswap/utils/isUndefinedOrNull'
import { InfinityCLPositionDetail } from '../type'
import { usePositionPrices } from './usePositionPrices'

export type PositionInfo = ReturnType<typeof useExtraInfinityPositionInfo>

export const useExtraInfinityPositionInfo = (positionDetail?: InfinityCLPositionDetail) => {
  const { chainId, tickLower, tickUpper, token0, token1, poolKey, liquidity, tickSpacing } = positionDetail ?? {}
  const currency0 = useCurrencyByChainId(token0, chainId) ?? undefined
  const currency1 = useCurrencyByChainId(token1, chainId) ?? undefined

  const poolId = useMemo(() => (poolKey ? getPoolId(poolKey) : undefined), [poolKey])
  const [, pool] = usePoolById<'CL'>(poolId, chainId)

  const { amount0, amount1 } = usePositionAmount({
    token0: currency0,
    token1: currency1,
    tickCurrent: pool?.tickCurrent,
    tickLower,
    tickUpper,
    sqrtRatioX96: pool?.sqrtRatioX96,
    liquidity,
  })

  const tickAtLimit = useIsTickAtLimit(tickLower, tickUpper, tickSpacing)

  const outOfRange = useMemo(() => {
    return !isUndefinedOrNull(pool?.tickCurrent) && !isUndefinedOrNull(tickLower) && !isUndefinedOrNull(tickUpper)
      ? pool!.tickCurrent < tickLower! || pool!.tickCurrent >= tickUpper!
      : false
  }, [pool?.tickCurrent, tickUpper, tickLower])

  const removed = useMemo(() => {
    return liquidity === 0n
  }, [liquidity])

  const { priceLower, priceUpper, priceCurrent, inverted, invert } = usePositionPrices({
    currencyA: currency0 ?? undefined,
    currencyB: currency1 ?? undefined,
    tickLower,
    tickUpper,
    tickCurrent: pool?.tickCurrent,
  })

  const [base, quote] = useMemo(
    () => (inverted ? [currency1, currency0] : [currency0, currency1]),
    [currency0, currency1, inverted],
  )

  return {
    poolId,
    pool,
    tickAtLimit,
    outOfRange,
    removed,
    price: priceCurrent,
    priceLower,
    priceUpper,
    currency0,
    currency1,
    quote,
    base,
    amount0,
    amount1,
    inverted,
    invert,
  }
}
