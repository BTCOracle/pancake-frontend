/* eslint-disable no-param-reassign */
import {
  Currency,
  CurrencyAmount,
  Fraction,
  Percent,
  Price,
  Rounding,
  UnifiedCurrency,
  UnifiedCurrencyAmount,
} from '@pancakeswap/swap-sdk-core'

export function formatPercent(percent?: Percent, precision?: number) {
  return percent ? formatFraction(percent.asFraction.multiply(100), precision) : undefined
}

export function formatFraction(
  fraction?: Fraction | null | undefined,
  precision: number | undefined = 6,
  rounding: Rounding | undefined = undefined,
) {
  if (!fraction || fraction.denominator === 0n) {
    return undefined
  }
  if (precision === 0 || fraction.greaterThan(10n ** BigInt(precision))) {
    return fraction.toFixed(0)
  }
  return fraction.toSignificant(precision, undefined, rounding)
}

export function formatPrice(price?: Price<Currency, Currency> | null | undefined, precision?: number | undefined) {
  if (!price) {
    return undefined
  }
  return formatFraction(price?.asFraction.multiply(price?.scalar), precision)
}

export function formatAmount(
  amount?: CurrencyAmount<Currency> | UnifiedCurrencyAmount<UnifiedCurrency> | null | undefined,
  precision?: number | undefined,
) {
  if (!amount) {
    return undefined
  }
  return formatFraction(
    amount?.asFraction.divide(10n ** BigInt(amount?.currency.decimals)),
    precision,
    Rounding.ROUND_DOWN,
  )
}

export function parseNumberToFraction(num: number, precision = 6) {
  if (Number.isNaN(num) || !Number.isFinite(num)) {
    return undefined
  }
  const scalar = 10 ** precision
  const scaledNum = num * scalar

  if (Number.isNaN(scaledNum) || !Number.isFinite(scaledNum)) {
    return undefined
  }

  return new Fraction(BigInt(Math.floor(scaledNum)), BigInt(scalar))
}

export function smartRoundNumber(value: string, decimals: number): string {
  if (value.startsWith('.')) value = `0${value}`
  if (value.endsWith('.')) value = `${value}0`

  const num = parseFloat(value)
  const prts = value.split('.')
  const intPart = prts[0]
  let decPart = prts[1] || ''

  if (!decPart || Number(decPart) === 0) return intPart

  decPart = decPart.replace(/0+$/, '')

  if (decPart.length <= decimals) {
    const roundRegex = new RegExp(`9{${Math.min(2, decimals)},}$`)
    if (roundRegex.test(decPart)) {
      const roundedNum = (num + parseFloat(`1e-${decPart.length}`)).toFixed(decPart.length)
      return parseFloat(roundedNum).toString()
    }
    return `${intPart}.${decPart}`
  }

  return num
    .toFixed(decimals)
    .replace(/\.0+$/, '')
    .replace(/(\.\d*[1-9])0+$/, '$1')
}
