import { Currency, Price, UnifiedCurrency } from '@pancakeswap/swap-sdk-core'
import BigNumber from 'bignumber.js'
import { useMemo } from 'react'
import { tryParsePrice } from './v3/utils'
import { useUnifiedTokenUsdPrice } from './useUnifiedTokenUsdPrice'

export const usePoolMarketPriceSlippage = (
  currency0?: UnifiedCurrency,
  currency1?: UnifiedCurrency,
  poolCurrencyPrice?: Price<Currency, Currency>,
) => {
  const { data: currency0marketPrice } = useUnifiedTokenUsdPrice(currency0, Boolean(currency0))
  const { data: currency1marketPrice } = useUnifiedTokenUsdPrice(currency1, Boolean(currency1))

  return useMemo(() => {
    if (!currency1marketPrice || !currency0marketPrice || !poolCurrencyPrice) return [undefined, undefined, undefined]

    const marketPrice = tryParsePrice(
      currency0,
      currency1,
      new BigNumber(currency0marketPrice).div(currency1marketPrice).toString(),
    )

    if (!poolCurrencyPrice || !marketPrice) return [undefined, undefined]

    return [
      marketPrice,
      marketPrice.divide(poolCurrencyPrice).subtract(1).multiply(100), // slippage in percentage
    ]
  }, [currency1marketPrice, currency0marketPrice, poolCurrencyPrice, currency0, currency1])
}

export const usePoolMarketPrice = (
  currency0?: UnifiedCurrency,
  currency1?: UnifiedCurrency,
): [number | undefined, number | undefined, Price<Currency, Currency> | undefined] => {
  const { data: currency0marketPrice } = useUnifiedTokenUsdPrice(currency0, Boolean(currency0))
  const { data: currency1marketPrice } = useUnifiedTokenUsdPrice(currency1, Boolean(currency1))

  return useMemo(() => {
    if (!currency1marketPrice || !currency0marketPrice) return [undefined, undefined, undefined]

    const marketPrice = tryParsePrice(
      currency0,
      currency1,
      new BigNumber(currency0marketPrice).div(currency1marketPrice).toString(),
    )

    return [currency0marketPrice, currency1marketPrice, marketPrice]
  }, [currency1marketPrice, currency0marketPrice, currency0, currency1])
}
