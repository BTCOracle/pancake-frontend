import { isSolana } from '@pancakeswap/chains'
import { Currency, CurrencyAmount, UnifiedCurrency, UnifiedCurrencyAmount } from '@pancakeswap/sdk'
import { PublicKey } from '@solana/web3.js'
import { BIG_INT_ZERO, MIN_BNB, MIN_SOL_RESERVER } from 'config/constants/exchange'

type NullableCurrencyAmount = CurrencyAmount<Currency> | undefined

/**
 * Given some token amount, return the max that can be spent of it
 * @param currencyAmount to return max of
 */
export function maxAmountSpend<T extends NullableCurrencyAmount>(currencyAmount?: T): T {
  if (!currencyAmount) return undefined as T
  if (currencyAmount.currency?.isNative) {
    if (currencyAmount.quotient > MIN_BNB) {
      return CurrencyAmount.fromRawAmount(currencyAmount.currency, currencyAmount.quotient - MIN_BNB) as T
    }
    return CurrencyAmount.fromRawAmount(currencyAmount.currency, BIG_INT_ZERO) as T
  }
  return currencyAmount
}

export function maxUnifiedAmountSpend<T extends NullableCurrencyAmount | UnifiedCurrencyAmount<UnifiedCurrency>>(
  currencyAmount?: T,
): T {
  if (!currencyAmount) return undefined as T
  const isNative = isSolana(currencyAmount.currency.chainId)
    ? currencyAmount.currency.isNative || currencyAmount.currency.address === PublicKey.default.toBase58()
    : currencyAmount.currency.isNative
  if (!isNative) {
    return currencyAmount
  }
  if (currencyAmount.currency.symbol.toLowerCase() === 'sol' && currencyAmount.quotient > MIN_SOL_RESERVER) {
    return UnifiedCurrencyAmount.fromRawAmount(currencyAmount.currency, currencyAmount.quotient - MIN_SOL_RESERVER) as T
  }
  if (currencyAmount.quotient > MIN_BNB) {
    return UnifiedCurrencyAmount.fromRawAmount(currencyAmount.currency, currencyAmount.quotient - MIN_BNB) as T
  }
  return UnifiedCurrencyAmount.fromRawAmount(currencyAmount.currency, BIG_INT_ZERO) as T
}
