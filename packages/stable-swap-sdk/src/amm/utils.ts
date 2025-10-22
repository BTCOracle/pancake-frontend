import { Currency, CurrencyAmount } from '@pancakeswap/swap-sdk-core'

const PRECISION = 10n ** 18n

export const getRawAmount = (amount: CurrencyAmount<Currency>) => {
  return amount.multiply(PRECISION).quotient / 10n ** BigInt(amount.currency.decimals)
}

export const parseAmount = (currency: Currency, rawAmount: bigint) => {
  const numerator = rawAmount * 10n ** BigInt(currency.decimals)
  const denominator = PRECISION
  return CurrencyAmount.fromFractionalAmount(currency, numerator, denominator)
}
