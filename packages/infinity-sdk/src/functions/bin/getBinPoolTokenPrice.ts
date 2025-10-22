import { Currency, Price } from '@pancakeswap/swap-sdk-core'

import { BinPoolState } from './createBinPool'

const BASIS = BigInt(10_000)
const LIMIT = BigInt(8388608)

export function getBinPoolTokenPrice(
  pool: Pick<BinPoolState, 'currencyX' | 'currencyY' | 'activeId' | 'binStep'>,
  base: Currency
) {
  const { binStep, activeId, currencyX, currencyY } = pool
  const exponent = BigInt(activeId) - LIMIT
  const priceRevert = exponent < 0n
  const exponentAbs = priceRevert ? -exponent : exponent
  const numerator = (BASIS + BigInt(binStep)) ** exponentAbs
  const denominator = BASIS ** exponentAbs

  const price = new Price(
    currencyX,
    currencyY,
    priceRevert ? numerator : denominator,
    priceRevert ? denominator : numerator
  )
  return base.wrapped.equals(currencyX.wrapped) ? price : price.invert()
}
