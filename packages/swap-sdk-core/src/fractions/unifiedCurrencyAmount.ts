import _Big from 'big.js'
import invariant from 'tiny-invariant'
// @ts-ignore
import toFormat from 'toformat'
import { UnifiedCurrency, UnifiedToken } from '../currency'
import { Token } from '../token'
import { Fraction } from './fraction'

import { BigintIsh, MaxUint256, Rounding } from '../constants'

const Big = toFormat(_Big)

export class UnifiedCurrencyAmount<T extends UnifiedCurrency> extends Fraction {
  public readonly currency: T

  public readonly decimalScale: bigint

  /**
   * Returns a new currency amount instance from the unitless amount of token, i.e. the raw amount
   * @param currency the currency in the amount
   * @param rawAmount the raw token or ether amount
   */
  public static fromRawAmount<T extends UnifiedCurrency>(currency: T, rawAmount: BigintIsh): UnifiedCurrencyAmount<T> {
    return new UnifiedCurrencyAmount(currency, rawAmount)
  }

  /**
   * Construct a currency amount with a denominator that is not equal to 1
   * @param currency the currency
   * @param numerator the numerator of the fractional token amount
   * @param denominator the denominator of the fractional token amount
   */
  public static fromFractionalAmount<T extends UnifiedCurrency>(
    currency: T,
    numerator: BigintIsh,
    denominator: BigintIsh
  ): UnifiedCurrencyAmount<T> {
    return new UnifiedCurrencyAmount(currency, numerator, denominator)
  }

  protected constructor(currency: T, numerator: BigintIsh, denominator?: BigintIsh) {
    super(numerator, denominator)
    invariant(this.quotient <= MaxUint256, 'AMOUNT')
    this.currency = currency
    this.decimalScale = 10n ** BigInt(currency.decimals)
  }

  public add(other: UnifiedCurrencyAmount<T>): UnifiedCurrencyAmount<T> {
    invariant(this.currency.equals(other.currency), 'CURRENCY')
    const added = super.add(other)
    return UnifiedCurrencyAmount.fromFractionalAmount(this.currency, added.numerator, added.denominator)
  }

  public subtract(value: bigint): UnifiedCurrencyAmount<T>

  public subtract(other: UnifiedCurrencyAmount<T>): UnifiedCurrencyAmount<T>

  public subtract(value: UnifiedCurrencyAmount<T> | bigint): UnifiedCurrencyAmount<T> {
    if (typeof value === 'bigint') {
      return UnifiedCurrencyAmount.fromFractionalAmount(
        this.currency,
        this.numerator - value * this.denominator,
        this.denominator
      )
    }

    invariant(this.currency.equals(value.currency), 'CURRENCY')
    const subtracted = super.subtract(value)
    return UnifiedCurrencyAmount.fromFractionalAmount(this.currency, subtracted.numerator, subtracted.denominator)
  }

  public multiply(other: Fraction | BigintIsh): UnifiedCurrencyAmount<T> {
    const multiplied = super.multiply(other)
    return UnifiedCurrencyAmount.fromFractionalAmount(this.currency, multiplied.numerator, multiplied.denominator)
  }

  public divide(other: Fraction | BigintIsh): UnifiedCurrencyAmount<T> {
    const divided = super.divide(other)
    return UnifiedCurrencyAmount.fromFractionalAmount(this.currency, divided.numerator, divided.denominator)
  }

  public toSignificant(significantDigits = 6, format?: object, rounding: Rounding = Rounding.ROUND_DOWN): string {
    return super.divide(this.decimalScale).toSignificant(significantDigits, format, rounding)
  }

  public toFixed(
    decimalPlaces: number = this.currency.decimals,
    format?: object,
    rounding: Rounding = Rounding.ROUND_DOWN
  ): string {
    invariant(decimalPlaces <= this.currency.decimals, 'DECIMALS')
    return super.divide(this.decimalScale).toFixed(decimalPlaces, format, rounding)
  }

  public toExact(format: object = { groupSeparator: '' }): string {
    Big.DP = this.currency.decimals
    return new Big(this.quotient.toString()).div(this.decimalScale.toString()).toFormat(format)
  }

  public get wrapped(): UnifiedCurrencyAmount<UnifiedToken> {
    if (this.currency.isToken) return this as UnifiedCurrencyAmount<Token>
    return UnifiedCurrencyAmount.fromFractionalAmount(this.currency.wrapped, this.numerator, this.denominator)
  }

  public info() {
    return `${this.toExact()}${this.currency.symbol}`
  }
}
