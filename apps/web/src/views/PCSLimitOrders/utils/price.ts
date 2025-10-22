import { Currency, Price } from '@pancakeswap/sdk'
import { BigNumber as BN } from 'bignumber.js'

export function bigNumberToPrice(
  bigNumber: BN,
  baseCurrency: Currency,
  quoteCurrency: Currency,
): Price<Currency, Currency> {
  // Handle edge cases
  if (!bigNumber.isFinite()) {
    return new Price(baseCurrency, quoteCurrency, 1n, 0n)
  }

  // Convert BigNumber to fraction
  const [intNumerator, intDenominator] = bigNumber.toFraction()

  return new Price(baseCurrency, quoteCurrency, BigInt(intDenominator.toString()), BigInt(intNumerator.toString()))
}
