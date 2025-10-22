import { BinPool, Pool } from '@pancakeswap/infinity-sdk'
import { Currency, CurrencyAmount, Price } from '@pancakeswap/swap-sdk-core'
import { maxLiquidityForAmount0Precise, maxLiquidityForAmount1, SqrtPriceMath, TickMath } from '@pancakeswap/v3-sdk'
import { useInfinityPoolIdRouteParams } from 'hooks/dynamicRoute/usePoolIdRoute'
import { useCLPriceRange } from 'hooks/infinity/useCLPriceRange'
import { useCurrencyByPoolId } from 'hooks/infinity/useCurrencyByPoolId'
import { atom, useAtom } from 'jotai'
import { useCallback, useMemo, useState } from 'react'
import { useBinRangeQueryState, useClRangeQueryState } from 'state/infinity/shared'
import tryParseCurrencyAmount from 'utils/tryParseCurrencyAmount'
import { parseUnits } from 'viem/utils'
import { isNumeric } from 'utils/isNumeric'
import { usePool } from './usePool'
import { usePoolActivePrice } from './usePoolActivePrice'

type LastEdit = {
  lastEditAmount: string
  lastEditCurrency: 0 | 1
}

/**
 * no need to track both currency amounts, only need to track the last edited one
 *
 * as we have the formula: startPriceAsFraction = amount1 / amount0
 *
 * so if we know the last edited currency, we can derive the other currency amount
 */
export const lastEditAtom = atom<LastEdit>({
  lastEditAmount: '',
  lastEditCurrency: 0,
})

export const useClDepositAmounts = () => {
  const [lastEdit, setLastEdit] = useAtom(lastEditAtom)
  const pool = usePool<'CL'>()
  const [{ lowerTick, upperTick }] = useClRangeQueryState()
  const { isDeposit0Enabled, isDeposit1Enabled } = useAddDepositAmountsEnabled()
  const [currency0, currency1] = useMemo(() => {
    if (!pool) return [undefined, undefined]

    return [pool.token0, pool.token1]
  }, [pool])

  const startPrice = useMemo(() => {
    if (!currency0 || !currency1 || !pool?.sqrtRatioX96) return undefined
    return new Price(currency0, currency1, 2n ** 192n, pool.sqrtRatioX96 * pool.sqrtRatioX96)
  }, [currency0, currency1, pool])

  const [depositCurrencyAmount0, depositCurrencyAmount1] = useMemo(() => {
    if (!currency0 || !currency1 || !startPrice || !pool || lowerTick === null || upperTick === null)
      return [undefined, undefined]

    let amount0: CurrencyAmount<Currency> | undefined
    let amount1: CurrencyAmount<Currency> | undefined

    if (lastEdit.lastEditCurrency === 0) {
      amount0 = tryParseCurrencyAmount(lastEdit.lastEditAmount, currency0)

      if (!amount0 || !startPrice || startPrice.equalTo(0)) return [undefined, undefined]

      if (isDeposit1Enabled) {
        const liquidity = maxLiquidityForAmount0Precise(
          pool.sqrtRatioX96,
          TickMath.getSqrtRatioAtTick(upperTick),
          amount0.quotient,
        )

        const amount1Raw = SqrtPriceMath.getAmount1Delta(
          TickMath.getSqrtRatioAtTick(lowerTick),
          pool.sqrtRatioX96,
          liquidity,
          false,
        )

        amount1 = CurrencyAmount.fromRawAmount(currency1, amount1Raw)
      } else {
        amount1 = CurrencyAmount.fromRawAmount(currency1, 0n)
      }
    } else {
      amount1 = tryParseCurrencyAmount(lastEdit.lastEditAmount, currency1)

      if (!amount1 || !startPrice || startPrice.equalTo(0)) return [undefined, undefined]

      if (isDeposit0Enabled) {
        const liquidity = maxLiquidityForAmount1(
          TickMath.getSqrtRatioAtTick(lowerTick),
          pool.sqrtRatioX96,
          amount1.quotient,
        )

        const amount0Raw = SqrtPriceMath.getAmount0Delta(
          pool.sqrtRatioX96,
          TickMath.getSqrtRatioAtTick(upperTick),
          liquidity,
          true,
        )

        amount0 = CurrencyAmount.fromRawAmount(currency0, amount0Raw)
      } else {
        amount0 = CurrencyAmount.fromRawAmount(currency0, 0n)
      }
    }

    return [amount0, amount1]
  }, [
    currency0,
    currency1,
    isDeposit0Enabled,
    isDeposit1Enabled,
    lastEdit.lastEditAmount,
    lastEdit.lastEditCurrency,
    lowerTick,
    pool,
    startPrice,
    upperTick,
  ])

  const handleDepositAmountChange = (amount: string, currency: 0 | 1) => {
    setLastEdit({ lastEditAmount: amount, lastEditCurrency: currency })
  }

  return {
    depositCurrencyAmount0,
    depositCurrencyAmount1,
    handleDepositAmountChange,
    inputValue0: lastEdit.lastEditCurrency === 0 ? lastEdit.lastEditAmount : depositCurrencyAmount0?.toExact(),
    inputValue1: lastEdit.lastEditCurrency === 1 ? lastEdit.lastEditAmount : depositCurrencyAmount1?.toExact(),
  }
}

const binDepositAmountsAtom = atom<{
  depositCurrencyAmount0: CurrencyAmount<Currency> | null
  depositCurrencyAmount1: CurrencyAmount<Currency> | null
}>({
  depositCurrencyAmount0: null,
  depositCurrencyAmount1: null,
})
const useBinDepositAmounts = () => {
  const pool = usePool<'Bin'>()
  const [currency0, currency1] = useMemo(() => {
    if (!pool) return [undefined, undefined]

    return [pool.token0, pool.token1]
  }, [pool])
  const [depositCurrencyAmounts, setDepositCurrencyAmounts] = useAtom(binDepositAmountsAtom)
  const [inputValue0, setInputValue0] = useState('')
  const [inputValue1, setInputValue1] = useState('')

  const { depositCurrencyAmount0, depositCurrencyAmount1 } = depositCurrencyAmounts

  const handleDepositAmountChange = useCallback(
    (amount: string, currency: 0 | 1) => {
      if (!currency0 || !currency1) return

      const rawAmount = amount === '' ? null : amount
      const parsedAmount = parseUnits(
        rawAmount && isNumeric(rawAmount) ? rawAmount : '0',
        currency === 0 ? currency0.decimals : currency1.decimals,
      )

      if (currency === 0) {
        setInputValue0(amount)
        setDepositCurrencyAmounts({
          ...depositCurrencyAmounts,
          depositCurrencyAmount0: amount === '' ? null : CurrencyAmount.fromRawAmount(currency0, parsedAmount),
        })
      } else {
        setInputValue1(amount)
        setDepositCurrencyAmounts({
          ...depositCurrencyAmounts,
          depositCurrencyAmount1: amount === '' ? null : CurrencyAmount.fromRawAmount(currency1, parsedAmount),
        })
      }
    },
    [currency0, currency1, depositCurrencyAmounts, setDepositCurrencyAmounts],
  )

  return {
    depositCurrencyAmount0,
    depositCurrencyAmount1,
    handleDepositAmountChange,
    inputValue0: depositCurrencyAmount0 ? inputValue0 : '',
    inputValue1: depositCurrencyAmount1 ? inputValue1 : '',
  }
}

export const useAddDepositAmounts = () => {
  const pool = usePool()

  const clDepositAmounts = useClDepositAmounts()
  const binDepositAmounts = useBinDepositAmounts()

  return pool?.poolType === 'Bin' ? binDepositAmounts : clDepositAmounts
}

export const useAddDepositAmountsEnabled = () => {
  const pool = usePool()
  const [{ lowerTick, upperTick }] = useClRangeQueryState()
  const [{ lowerBinId, upperBinId }] = useBinRangeQueryState()
  const { poolId, chainId } = useInfinityPoolIdRouteParams()
  const { currency0, currency1 } = useCurrencyByPoolId({ poolId, chainId })
  const activePrice = usePoolActivePrice()
  const clTickSpacing = useMemo(() => {
    if (!pool) return undefined
    const { tickSpacing } = pool as Pool

    return tickSpacing
  }, [pool])
  const { lowerPrice, upperPrice } = useCLPriceRange(currency0, currency1, clTickSpacing ?? undefined)

  const isDepositEnabled = useMemo(() => {
    if (!pool) return false
    if (pool.poolType === 'CL') {
      return lowerTick !== null && upperTick !== null
    }
    return Boolean(activePrice && !activePrice.equalTo(0) && lowerBinId !== null && upperBinId !== null)
  }, [pool, lowerTick, upperTick, lowerBinId, upperBinId, activePrice])

  const isBinInRange = useMemo(() => {
    if (!pool) return false
    if (pool.poolType === 'Bin') {
      const { activeId } = pool as BinPool
      return Boolean(activeId && lowerBinId && upperBinId && lowerBinId <= activeId && activeId <= upperBinId)
    }
    return false
  }, [pool, lowerBinId, upperBinId])

  const isDeposit0Enabled = useMemo(() => {
    if (!pool) return false
    if (pool.poolType === 'CL') {
      return Boolean(isDepositEnabled && upperPrice && activePrice?.lessThan(upperPrice))
    }
    if (pool.poolType === 'Bin') {
      const { activeId } = pool as BinPool
      return Boolean(isDepositEnabled && lowerBinId && activeId && (lowerBinId >= activeId || isBinInRange))
    }
    return false
  }, [pool, isDepositEnabled, upperPrice, activePrice, lowerBinId, isBinInRange])

  const isDeposit1Enabled = useMemo(() => {
    if (!pool) return false

    if (pool.poolType === 'CL') {
      return Boolean(isDepositEnabled && lowerPrice && activePrice?.greaterThan(lowerPrice))
    }
    if (pool.poolType === 'Bin') {
      const { activeId } = pool as BinPool
      return Boolean(isDepositEnabled && upperBinId && activeId && (upperBinId <= activeId || isBinInRange))
    }
    return false
  }, [pool, isDepositEnabled, lowerPrice, activePrice, upperBinId, isBinInRange])

  return {
    isDepositEnabled,
    isDeposit0Enabled,
    isDeposit1Enabled,
  }
}
