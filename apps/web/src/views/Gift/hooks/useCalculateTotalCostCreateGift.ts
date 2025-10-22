import { CurrencyAmount, NativeCurrency, Token } from '@pancakeswap/sdk'
import { useStablecoinPrice } from 'hooks/useStablecoinPrice'
import { multiplyPriceByAmount } from 'utils/prices'

export function useCalculateTotalCostCreateGift({
  tokenAmount,
  nativeAmount,
}: {
  tokenAmount?: CurrencyAmount<Token | NativeCurrency>
  nativeAmount?: CurrencyAmount<NativeCurrency>
}) {
  const stablePrice = useStablecoinPrice(tokenAmount?.currency)
  const stableNativePrice = useStablecoinPrice(nativeAmount?.currency)

  const tokenUsd = multiplyPriceByAmount(stablePrice, parseFloat(tokenAmount?.toExact() || '0'))
  const nativeUsd = multiplyPriceByAmount(stableNativePrice, parseFloat(nativeAmount?.toExact() || '0'))

  return tokenUsd + nativeUsd
}
