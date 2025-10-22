import { Currency, CurrencyAmount } from '@pancakeswap/swap-sdk-core'
import { PositionMath } from '@pancakeswap/v3-sdk'
import isUndefined from 'lodash/isUndefined'
import { useMemo } from 'react'

interface PositionAmountParams {
  token0?: Currency | null
  token1?: Currency | null
  tickCurrent?: number
  tickLower?: number
  tickUpper?: number
  sqrtRatioX96?: bigint
  liquidity?: bigint
}

export const usePositionAmount = ({
  token0,
  token1,
  tickCurrent,
  tickLower,
  tickUpper,
  sqrtRatioX96,
  liquidity,
}: PositionAmountParams) => {
  /**
   * Returns the price of token0 at the upper tick
   */
  const amount0: CurrencyAmount<Currency> | undefined = useMemo(() => {
    if (
      !token0 ||
      isUndefined(tickCurrent) ||
      isUndefined(tickLower) ||
      isUndefined(tickUpper) ||
      !sqrtRatioX96 ||
      !liquidity
    ) {
      return undefined
    }
    return CurrencyAmount.fromRawAmount(
      token0,
      PositionMath.getToken0Amount(tickCurrent, tickLower, tickUpper, sqrtRatioX96, liquidity),
    )
  }, [token0, tickCurrent, tickLower, tickUpper, sqrtRatioX96, liquidity])

  /**
   * Returns the amount of token1 that this position's liquidity could be burned for at the current pool price
   */
  const amount1: CurrencyAmount<Currency> | undefined = useMemo(() => {
    if (
      !token1 ||
      isUndefined(tickCurrent) ||
      isUndefined(tickLower) ||
      isUndefined(tickUpper) ||
      !sqrtRatioX96 ||
      !liquidity
    ) {
      return undefined
    }
    return CurrencyAmount.fromRawAmount(
      token1,
      PositionMath.getToken1Amount(tickCurrent, tickLower, tickUpper, sqrtRatioX96, liquidity),
    )
  }, [token1, tickCurrent, tickLower, tickUpper, sqrtRatioX96, liquidity])

  const deposit0Disabled = Boolean(typeof tickUpper === 'number' && tickCurrent && tickCurrent > tickUpper)
  const deposit1Disabled = Boolean(typeof tickLower === 'number' && tickCurrent && tickCurrent < tickLower)
  const invalidRange = Boolean(typeof tickLower === 'number' && typeof tickUpper === 'number' && tickLower > tickUpper)

  return {
    amount0,
    amount1,
    deposit0Disabled,
    deposit1Disabled,
    invalidRange,
  }
}
