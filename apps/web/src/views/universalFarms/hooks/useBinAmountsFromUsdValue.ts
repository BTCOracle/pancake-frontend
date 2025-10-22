import { CurrencyAmount } from '@pancakeswap/swap-sdk-core'
import BN from 'bignumber.js'
import { useMemo } from 'react'

export const useBinAmountsFromUsdValue = ({ usdValue, currency0, currency1, currency0UsdPrice, currency1UsdPrice }) => {
  const usdAmount = parseFloat(usdValue) / 2

  const amount0 = useMemo(() => {
    if (!currency0 || !currency0UsdPrice) return undefined
    const amount = new BN(usdAmount).times(10 ** currency0.decimals).div(currency0UsdPrice ?? 1)
    const [n, d] = amount.isFinite() ? amount.toFraction() : [0, 1]
    return CurrencyAmount.fromFractionalAmount(currency0, n.toString(), d.toString())
  }, [usdAmount, currency0, currency0UsdPrice])

  const amount1 = useMemo(() => {
    if (!currency1 || !currency1UsdPrice) return undefined
    const amount = new BN(usdAmount).times(10 ** currency1.decimals).div(currency1UsdPrice ?? 1)
    const [n, d] = amount.isFinite() ? amount.toFraction() : [0, 1]
    return CurrencyAmount.fromFractionalAmount(currency1, n.toString(), d.toString())
  }, [usdAmount, currency1, currency1UsdPrice])

  return [amount0, amount1]
}
