import { Token } from '@pancakeswap/swap-sdk-core'
import { describe, expect, test } from 'vitest'

import { getBinPoolTokenPrice } from './getBinPoolTokenPrice'

const sAVAX = new Token(43114, '0x2b2C81e08f1Af8835a78Bb2A90AE924ACE0eA4bE', 18, 'sAVAX')
const AVAX = new Token(43114, '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7', 18, 'WAVAX')
const USDC = new Token(43114, '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E', 6, 'USDC')
const BTCb = new Token(43114, '0x152b9d0FdC40C096757F570A51E494bd4b943E50', 8, 'BTC.b')

describe('getBinPoolTokenPrice', () => {
  test('same decimals', () => {
    const priceOfSAvax = getBinPoolTokenPrice(
      {
        currencyX: sAVAX,
        currencyY: AVAX,
        binStep: BigInt(5),
        activeId: BigInt(8388755),
      },
      sAVAX
    )
    const priceOfAVAX = getBinPoolTokenPrice(
      {
        currencyX: sAVAX,
        currencyY: AVAX,
        binStep: BigInt(5),
        activeId: BigInt(8388755),
      },
      AVAX
    )
    expect(priceOfSAvax.toSignificant(18)).toEqual('1.07624876700877799')
    expect(priceOfSAvax.baseCurrency).toEqual(sAVAX)
    expect(priceOfAVAX.toSignificant(18)).toEqual('0.929153213136126089')
    expect(priceOfAVAX.baseCurrency).toEqual(AVAX)
  })

  test('different decimals', () => {
    const priceOfBTCb = getBinPoolTokenPrice(
      {
        currencyX: BTCb,
        currencyY: USDC,
        binStep: BigInt(10),
        activeId: BigInt(8394314),
      },
      BTCb
    )
    const priceOfUSDC = getBinPoolTokenPrice(
      {
        currencyX: BTCb,
        currencyY: USDC,
        binStep: BigInt(10),
        activeId: BigInt(8394314),
      },
      USDC
    )
    expect(priceOfBTCb.toSignificant(18)).toEqual('29980.9987975234953')
    expect(priceOfBTCb.baseCurrency).toEqual(BTCb)
    expect(priceOfUSDC.toSignificant(18)).toEqual('0.0000333544591610671248')
    expect(priceOfUSDC.baseCurrency).toEqual(USDC)
  })
})
