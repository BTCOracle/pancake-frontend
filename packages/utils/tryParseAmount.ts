import { Currency, CurrencyAmount, UnifiedCurrency, UnifiedCurrencyAmount } from '@pancakeswap/swap-sdk-core'
import { parseUnits } from './viem/parseUnits'

// try to parse a user entered amount for a given token
function tryParseAmount<T extends Currency>(value?: string, currency?: T | null): CurrencyAmount<T> | undefined
function tryParseAmount<T extends UnifiedCurrency>(
  value?: string,
  currency?: T | null,
): UnifiedCurrencyAmount<T> | undefined
function tryParseAmount(
  value?: string,
  currency?: UnifiedCurrency | null,
): CurrencyAmount<Currency> | UnifiedCurrencyAmount<UnifiedCurrency> | undefined {
  if (!value || !currency) {
    return undefined
  }
  try {
    const typedValueParsed = parseUnits(value as `${number}`, currency.decimals).toString()

    if (typedValueParsed !== '0') {
      // Check if it's a regular Currency (EVM) and not a Solana currency
      if ('chainId' in currency && !('programId' in currency)) {
        return CurrencyAmount.fromRawAmount(currency as Currency, BigInt(typedValueParsed))
      }
      // Otherwise use UnifiedCurrencyAmount for Solana currencies or when in doubt
      return UnifiedCurrencyAmount.fromRawAmount(currency, BigInt(typedValueParsed))
    }
  } catch (error) {
    // should fail if the user specifies too many decimal places of precision (or maybe exceed max uint?)
    console.debug(`Failed to parse input amount: "${value}"`, error)
  }
  // necessary for all paths to return a value
  return undefined
}

export default tryParseAmount
