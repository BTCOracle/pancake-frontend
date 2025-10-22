import type { Currency, CurrencyAmount } from '@pancakeswap/swap-sdk-core'
import type { IFOUserStatus } from '../ifov2.types'

// Sum claimable amounts from user statuses to get total allocation
export const getAllocationCurrencyAmount = (
  users?: (IFOUserStatus | undefined)[],
): CurrencyAmount<Currency> | undefined => {
  return users?.reduce<CurrencyAmount<Currency> | undefined>((acc, user) => {
    if (!user?.claimableAmount) {
      return acc
    }
    return acc ? acc.add(user.claimableAmount) : user.claimableAmount
  }, undefined)
}

export default getAllocationCurrencyAmount
