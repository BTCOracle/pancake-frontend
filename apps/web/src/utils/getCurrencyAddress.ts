import { Currency } from '@pancakeswap/swap-sdk-core'
import { Address, zeroAddress } from 'viem'

export const getCurrencyAddress = (
  currency: Currency | undefined | null,
  nativeCurrencyAliasAddress: Address | undefined = zeroAddress,
) => {
  if (!currency) {
    return undefined
  }

  if (currency.isNative) {
    return nativeCurrencyAliasAddress
  }

  return currency.address
}
