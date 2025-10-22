import { Currency, Price } from '@pancakeswap/swap-sdk-core'
import BigNumber from 'bignumber.js'

/**
 * Returns the price of bin given its id and the bin step
 */
export const getIdFromPrice = (price: number, binStep: number): number => {
  return Math.round(Math.log(price) / Math.log(1 + binStep / 10000)) + 2 ** 23
}

export const getIdFromCurrencyPrice = (price: Price<Currency, Currency>, binStep: number): number => {
  return getIdFromPrice(
    Number(new BigNumber(price.numerator.toString()).div(price.denominator.toString()).toFixed()),
    binStep
  )
}

/**
 * @deprecated
 */
export const getIdFromInvertedPrice = (price: number, binStep: number): number => {
  return 2 ** 23 - getIdFromPrice(price, binStep)
}
