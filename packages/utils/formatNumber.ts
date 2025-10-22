import BigNumber from 'bignumber.js'
import { BIG_ONE, BIG_TEN, BIG_ZERO } from './bigNumber'

const DEFAULT_FORMAT_CONFIG = {
  prefix: '',
  decimalSeparator: '.',
  groupSeparator: ',',
  groupSize: 3,
  secondaryGroupSize: 0,
  fractionGroupSeparator: ' ',
  fractionGroupSize: 0,
  suffix: '',
}

const subscriptNumbers: string[] = ['₀', '₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈', '₉']

function toSubscript(number: number): string {
  return number
    .toString()
    .split('')
    .map((digit) => subscriptNumbers[parseInt(digit, 10)])
    .join('')
}

function decimalTrailingZeroesToExponent(formattedNumber: string, maximumDecimalTrailingZeroes: number): string {
  const decimalTrailingZeroesPattern = new RegExp(`(\\.|,)(0{${maximumDecimalTrailingZeroes + 1},})(?=[1-9]?)`)
  return formattedNumber.replace(
    decimalTrailingZeroesPattern,
    (_match, separator, decimalTrailingZeroes) => `${separator}0${toSubscript(decimalTrailingZeroes.length)}`,
  )
}

function getIntegerDigits(value: BigNumber) {
  return value.integerValue(BigNumber.ROUND_DOWN).sd(true)
}

function getTotalDigits(value: BigNumber) {
  const [integerDigits, decimalDigits] = getDigits(value)
  return integerDigits + decimalDigits
}

export function getDigits(value: BigNumber) {
  return [getIntegerDigits(value), value.decimalPlaces() ?? 0]
}

type Options = {
  maximumSignificantDigits?: number
  roundingMode?: BigNumber.RoundingMode
  maxDecimalDisplayDigits?: number
  maximumDecimalTrailingZeroes?: number
}

/**
 * Format a number with configurable precision and optional subscript notation for trailing zeros
 *
 * @example
 * formatNumber(0.00003615) // '0.00003615'
 * formatNumber(0.00003615, { maximumDecimalTrailingZeroes: 3 }) // '0.0₄3615'
 * formatNumber(0.00000000089912, { maximumDecimalTrailingZeroes: 5 }) // '0.0₉8991'
 * formatNumber(1234.567, { maxDecimalDisplayDigits: 2 }) // '1,234.57'
 */
export function formatNumber(
  value: string | number | BigNumber,
  {
    maximumSignificantDigits = 12,
    roundingMode = BigNumber.ROUND_DOWN,
    maxDecimalDisplayDigits,
    maximumDecimalTrailingZeroes,
  }: Options = {},
) {
  const valueInBN = new BigNumber(value)
  if (valueInBN.eq(BIG_ZERO)) {
    return valueInBN.toString()
  }
  const [integerDigits, decimalDigits] = getDigits(valueInBN)
  const totalDigits = integerDigits + decimalDigits
  const maxDigits = Math.min(totalDigits, maximumSignificantDigits)
  const { max, min } = {
    max: BIG_TEN.exponentiatedBy(maximumSignificantDigits).minus(1),
    min: BIG_ONE.div(BIG_TEN.exponentiatedBy(maximumSignificantDigits - 1)),
  }
  const isGreaterThanMax = valueInBN.gt(max)
  const isLessThanMin = valueInBN.lt(min)
  const bnToDisplay = isGreaterThanMax ? max : isLessThanMin ? min : valueInBN
  const digitsAvailable = Math.min(maxDecimalDisplayDigits ?? maxDigits, maxDigits - integerDigits)
  const decimalPlaces = digitsAvailable < 0 ? 0 : digitsAvailable
  const valueToDisplay = bnToDisplay.toFormat(decimalPlaces, roundingMode, DEFAULT_FORMAT_CONFIG)
  const limitIndicator = isGreaterThanMax ? '>' : isLessThanMin ? '<' : ''
  let result = `${limitIndicator}${valueToDisplay}`

  // Apply subscript formatting for trailing zeros if maximumDecimalTrailingZeroes is specified
  if (typeof maximumDecimalTrailingZeroes !== 'undefined') {
    result = decimalTrailingZeroesToExponent(result, maximumDecimalTrailingZeroes)
  }

  return result
}

export function formatNumberWithFullDigits(
  value: string | number | BigNumber,
  options?: Omit<Options, 'maximumSignificantDigits'>,
) {
  const valueInBN = new BigNumber(value)
  return formatNumber(valueInBN, { ...options, maximumSignificantDigits: getTotalDigits(valueInBN) })
}

/**
 * Convert scientific notation (exponentials) to decimal
 */
export function formatScientificToDecimal(value: string | number): string {
  if (typeof value === 'number') {
    return formatScientificToDecimal(value.toString())
  }
  // If it's already a regular decimal string, return as is
  if (!value.includes('e')) {
    return value
  }

  // Convert scientific notation to decimal
  return Number(value).toLocaleString('fullwide', { useGrouping: false })
}
