import { Currency } from '@pancakeswap/swap-sdk-core'
import BigNumber from 'bignumber.js'
import { describe, expect, it } from 'vitest'
import { getCurrencyPriceFromId, getPriceFromId, getPriceX128FromId } from './getPriceFromId'

describe('getPriceX128FromId', () => {
  it('exp = 0', () => {
    expect(getPriceX128FromId(8388608n, 10n)).toBe(340282366920938463463374607431768211456n)
  })
  it('exp < 0', () => {
    expect(getPriceX128FromId(8375542n, 10n)).toBe(724741449435749248767161795233422n)
  })
  it('exp > 0x100000', () => {
    expect(() => getPriceX128FromId(0n, 10n)).toThrow('Invariant failed: EXPONENT')
  })
  it('binStep = 0', () => {
    expect(getPriceX128FromId(8388608n, 0n)).toBe(340282366920938463463374607431768211456n)
    expect(getPriceX128FromId(8375541n, 0n)).toBe(340282366920938463463374607431768198389n)
  })
})

describe('getCurrenciesPriceFromId', () => {
  const baseCurrency = { decimals: 18 } as Currency
  const quoteCurrency = { decimals: 18 } as Currency
  const quoteCurrency6Decimals = { decimals: 6 } as Currency
  const baseCurrency6Decimals = { decimals: 6 } as Currency

  it('same decimals: 1', () => {
    const currencyPrice = getCurrencyPriceFromId(8388608, 10, baseCurrency, quoteCurrency)
    expect(currencyPrice.toSignificant(18)).toEqual(getPriceFromId(8388608, 10).toString())
  })

  it('same decimals: 2', () => {
    const currencyPrice = getCurrencyPriceFromId(8388703, 11, baseCurrency, quoteCurrency)
    expect(currencyPrice.toSignificant(18)).toEqual(getPriceFromId(8388703, 11).toString())
  })

  it('different decimals: 1', () => {
    const currencyPrice = getCurrencyPriceFromId(8388608, 10, baseCurrency, quoteCurrency6Decimals)
    const scalar = new BigNumber((10n ** BigInt(baseCurrency.decimals)).toString()).div(
      (10n ** BigInt(quoteCurrency6Decimals.decimals)).toString()
    )

    expect(currencyPrice.toSignificant(18)).toEqual(scalar.times(getPriceFromId(8388608, 10)).toFixed())
  })

  it('different decimals: 2', () => {
    const currencyPrice = getCurrencyPriceFromId(8388608, 10, baseCurrency6Decimals, quoteCurrency)
    const scalar = new BigNumber((10n ** BigInt(baseCurrency6Decimals.decimals)).toString()).div(
      (10n ** BigInt(quoteCurrency.decimals)).toString()
    )
    expect(currencyPrice.toSignificant(18)).toEqual(scalar.times(getPriceFromId(8388608, 10)).toFixed())
  })
  it('different decimals: 3', () => {
    const currencyPrice = getCurrencyPriceFromId(8388703, 10, baseCurrency, quoteCurrency6Decimals)
    const scalar = new BigNumber((10n ** BigInt(baseCurrency.decimals)).toString()).div(
      (10n ** BigInt(quoteCurrency6Decimals.decimals)).toString()
    )

    expect(currencyPrice.toSignificant(18)).toEqual(scalar.times(getPriceFromId(8388703, 10)).toFixed())
  })
  it('different decimals: 4', () => {
    const currencyPrice = getCurrencyPriceFromId(8388703, 10, baseCurrency6Decimals, quoteCurrency)
    const scalar = new BigNumber((10n ** BigInt(baseCurrency6Decimals.decimals)).toString()).div(
      (10n ** BigInt(quoteCurrency.decimals)).toString()
    )
    expect(currencyPrice.toSignificant(18)).toEqual(scalar.times(getPriceFromId(8388703, 10)).toFixed())
  })
})
