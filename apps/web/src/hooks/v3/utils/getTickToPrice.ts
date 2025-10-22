import { Currency, Price, Token } from '@pancakeswap/swap-sdk-core'
import { tickToPrice } from '@pancakeswap/v3-sdk'

export function getTickToPrice<T extends Currency | Token = Token>(
  baseToken?: T,
  quoteToken?: T,
  tick?: number,
): Price<T, T> | undefined {
  if (!baseToken || !quoteToken || typeof tick !== 'number') {
    return undefined
  }
  return tickToPrice(baseToken, quoteToken, tick)
}
