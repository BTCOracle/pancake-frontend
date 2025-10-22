import { BinPool, Pool } from '@pancakeswap/infinity-sdk'
import { useCLPriceRange } from 'hooks/infinity/useCLPriceRange'
import { useMemo } from 'react'
import { useBinRangeQueryState, useClRangeQueryState } from 'state/infinity/shared'
import { useErrorMsg } from 'views/IncreaseLiquidity/hooks/useErrorMsg'
import { useAddDepositAmounts, useAddDepositAmountsEnabled } from './useAddDepositAmounts'
import { useBinIdRange } from './useBinIdRange'
import { usePool } from './usePool'
import { usePoolActivePrice } from './usePoolActivePrice'

export const useAddFormSubmitEnabled = () => {
  const pool = usePool()

  const [currencyA, currencyB] = useMemo(() => {
    return [pool?.token0, pool?.token1]
  }, [pool])
  const activePrice = usePoolActivePrice()
  const { depositCurrencyAmount0, depositCurrencyAmount1 } = useAddDepositAmounts()
  const { isDeposit0Enabled, isDeposit1Enabled } = useAddDepositAmountsEnabled()

  const { errorMessage } = useErrorMsg({
    currencyA,
    currencyB,
    currencyAAmount: isDeposit0Enabled && depositCurrencyAmount0 ? depositCurrencyAmount0 : undefined,
    currencyBAmount: isDeposit1Enabled && depositCurrencyAmount1 ? depositCurrencyAmount1 : undefined,
    allowSingleSide:
      pool?.poolType === 'Bin' ||
      (isDeposit0Enabled && !isDeposit1Enabled) ||
      (!isDeposit0Enabled && isDeposit1Enabled),
  })

  const [{ lowerTick, upperTick }] = useClRangeQueryState()
  const [{ lowerBinId, upperBinId }] = useBinRangeQueryState()
  const clTickSpacing = useMemo(() => {
    if (!pool) return undefined
    const { tickSpacing } = pool as Pool

    return tickSpacing
  }, [pool])
  const activeId = pool?.poolType === 'CL' ? null : (pool as BinPool)?.activeId
  const { lowerPrice, upperPrice } = useCLPriceRange(currencyA, currencyB, clTickSpacing ?? undefined)

  const invalidClRange = useMemo(() => {
    if (pool?.poolType === 'CL') {
      return Boolean(typeof lowerTick === 'number' && typeof upperTick === 'number' && lowerTick >= upperTick)
    }

    return false
  }, [lowerTick, upperTick, pool?.poolType])

  const { minBinId, maxBinId } = useBinIdRange()

  const invalidBinRange = useMemo(() => {
    if (pool?.poolType === 'Bin') {
      if (!lowerBinId || !upperBinId) return true
      if (lowerBinId > upperBinId) return true
      if ((minBinId && lowerBinId < minBinId) || (maxBinId && lowerBinId > maxBinId)) return true

      if ((minBinId && upperBinId < minBinId) || (maxBinId && upperBinId > maxBinId)) return true
    }
    return false
  }, [lowerBinId, maxBinId, minBinId, pool?.poolType, upperBinId])

  const outOfRange = useMemo(() => {
    if (pool?.poolType === 'Bin') {
      return Boolean(lowerBinId && upperBinId && activeId && (activeId < lowerBinId || activeId > upperBinId))
    }
    return Boolean(
      lowerPrice &&
        upperPrice &&
        activePrice &&
        (activePrice.lessThan(lowerPrice) || activePrice.greaterThan(upperPrice)),
    )
  }, [pool?.poolType, lowerPrice, upperPrice, activePrice, lowerBinId, upperBinId, activeId])

  const invalidDepositAmount = useMemo(() => {
    if (pool?.poolType === 'Bin') {
      return (isDeposit0Enabled && !depositCurrencyAmount0) || (isDeposit1Enabled && !depositCurrencyAmount1)
    }
    return !depositCurrencyAmount0 || !depositCurrencyAmount1
  }, [depositCurrencyAmount0, depositCurrencyAmount1, isDeposit0Enabled, isDeposit1Enabled, pool?.poolType])

  return {
    errorMessage,
    outOfRange,
    invalidClRange,
    invalidBinRange,
    invalidDepositAmount,
    enabled: !errorMessage && !invalidClRange && !invalidBinRange && !invalidDepositAmount,
  }
}
