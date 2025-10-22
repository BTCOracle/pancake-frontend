import { Currency, ZERO_ADDRESS } from '@pancakeswap/sdk'

export function currencyAddressInfinity(currency: Currency) {
  return currency.isNative ? ZERO_ADDRESS : currency.wrapped.address
}
