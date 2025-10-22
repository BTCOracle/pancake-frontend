import { Currency } from '@pancakeswap/swap-sdk-core'
import { describe, expect, it } from 'vitest'
import { getIdFromCurrencyPrice, getIdFromPrice } from './getIdFromPrice'
import { getCurrencyPriceFromId } from './getPriceFromId'

// @notice: getIdFromPrice have a precision issue,
// cannot 100% match the getPriceFromId,
describe('getIdFromPrice', () => {
  it('works when the price is lower than 1', () => {
    expect(getIdFromPrice(0.9999, 1)).toEqual(8388607)
  })
  it('works when the price is greater than 1', () => {
    expect(getIdFromPrice(1.0001, 1)).toEqual(8388609)
  })
})

describe('getIdFromCurrencyPrice', () => {
  const baseCurrency = { decimals: 18 } as Currency
  const quoteCurrency = { decimals: 18 } as Currency
  const quoteCurrency6Decimals = { decimals: 6 } as Currency
  const baseCurrency6Decimals = { decimals: 6 } as Currency

  it('same decimals: 1', () => {
    const currencyPrice = getCurrencyPriceFromId(8388608, 10, baseCurrency, quoteCurrency)
    expect(getIdFromCurrencyPrice(currencyPrice, 10)).toEqual(8388608)
  })

  it('same decimals: 2', () => {
    const currencyPrice = getCurrencyPriceFromId(8388703, 11, baseCurrency, quoteCurrency)
    expect(getIdFromCurrencyPrice(currencyPrice, 11)).toEqual(8388703)
  })

  it('different decimals: 1', () => {
    const currencyPrice = getCurrencyPriceFromId(8388608, 10, baseCurrency, quoteCurrency6Decimals)

    expect(getIdFromCurrencyPrice(currencyPrice, 10)).toEqual(8388608)
  })

  it('different decimals: 2', () => {
    const currencyPrice = getCurrencyPriceFromId(8388608, 10, baseCurrency6Decimals, quoteCurrency)

    expect(getIdFromCurrencyPrice(currencyPrice, 10)).toEqual(8388608)
  })
  it('different decimals: 3', () => {
    const currencyPrice = getCurrencyPriceFromId(8388703, 10, baseCurrency, quoteCurrency6Decimals)
    expect(getIdFromCurrencyPrice(currencyPrice, 10)).toEqual(8388703)
  })
  it('different decimals: 4', () => {
    const currencyPrice = getCurrencyPriceFromId(8388703, 10, baseCurrency6Decimals, quoteCurrency)

    expect(getIdFromCurrencyPrice(currencyPrice, 10)).toEqual(8388703)
  })
})
