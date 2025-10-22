import BigNumber from 'bignumber.js'
import { BIG_TEN } from './bigNumber'
import memoize from './memoize'

export const getFullDecimalMultiplier = memoize((decimals: number): BigNumber => {
  return BIG_TEN.pow(decimals)
})
