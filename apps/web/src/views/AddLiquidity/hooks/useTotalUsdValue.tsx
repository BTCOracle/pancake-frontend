import { useMemo } from 'react'
import { Currency, CurrencyAmount } from '@pancakeswap/sdk'
import { useStablecoinPriceAmount } from 'hooks/useStablecoinPrice'
import { formatAmount } from '@pancakeswap/utils/formatFractions'

interface UseTotalUsdValueParams {
  parsedAmountA: CurrencyAmount<Currency> | undefined
  parsedAmountB: CurrencyAmount<Currency> | undefined
}

export const useTotalUsdValue = (params: UseTotalUsdValueParams) => {
  const { parsedAmountA, parsedAmountB } = params

  const currencyA = parsedAmountA?.currency
  const currencyB = parsedAmountB?.currency

  const stablePriceA = useStablecoinPriceAmount(currencyA, Number(formatAmount(parsedAmountA, 18)), {
    enabled: Boolean(currencyA),
  })
  const stablePriceB = useStablecoinPriceAmount(currencyB, Number(formatAmount(parsedAmountB, 18)), {
    enabled: Boolean(currencyB),
  })

  // Calculate total USD value
  const totalUsdValue = useMemo(() => {
    const amountA = stablePriceA ?? 0
    const amountB = stablePriceB ?? 0
    const result = amountA + amountB
    return Number.isNaN(result) ? 0 : result
  }, [stablePriceA, stablePriceB])

  return {
    totalUsdValue,
  }
}
