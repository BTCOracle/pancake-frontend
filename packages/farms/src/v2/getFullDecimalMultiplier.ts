import { BIG_TEN } from '@pancakeswap/utils/bigNumber'
import memoize from '@pancakeswap/utils/memoize'
import BN from 'bignumber.js'

export const getFullDecimalMultiplier = memoize((decimals: number): BN => {
  return BIG_TEN.pow(decimals)
})
