import { DeserializedPool } from '@pancakeswap/pools'
import { Token } from '@pancakeswap/sdk'
import { deserializeToken } from '@pancakeswap/token-lists'
import { BIG_ZERO } from '@pancakeswap/utils/bigNumber'
import BigNumber from 'bignumber.js'
import { SerializedPool } from 'state/types'
import { safeGetAddress } from 'utils'

type UserData =
  | DeserializedPool<Token>['userData']
  | {
      allowance: number | string
      stakingTokenBalance: number | string
      stakedBalance: number | string
      pendingReward: number | string
    }

export const transformUserData = (userData: UserData) => {
  return {
    allowance: userData?.allowance ? new BigNumber(userData.allowance) : BIG_ZERO,
    stakingTokenBalance: userData?.stakingTokenBalance ? new BigNumber(userData.stakingTokenBalance) : BIG_ZERO,
    stakedBalance: userData?.stakedBalance ? new BigNumber(userData.stakedBalance) : BIG_ZERO,
    pendingReward: userData?.pendingReward ? new BigNumber(userData.pendingReward) : BIG_ZERO,
  }
}

const transformProfileRequirement = (profileRequirement?: { required: boolean; thresholdPoints: string }) => {
  return profileRequirement
    ? {
        required: profileRequirement.required,
        thresholdPoints: profileRequirement.thresholdPoints
          ? new BigNumber(profileRequirement.thresholdPoints)
          : BIG_ZERO,
      }
    : undefined
}

export const transformPool = (pool: SerializedPool): DeserializedPool<Token> => {
  const {
    totalStaked,
    stakingLimit,
    numberSecondsForUserLimit,
    userData,
    stakingToken,
    earningToken,
    profileRequirement,
    startTimestamp,
    ...rest
  } = pool

  return {
    ...rest,
    startTimestamp,
    profileRequirement: transformProfileRequirement(profileRequirement),
    stakingToken: deserializeToken(stakingToken),
    earningToken: deserializeToken(earningToken),
    userData: transformUserData(userData),
    totalStaked: new BigNumber(totalStaked || '0'),
    stakingLimit: new BigNumber(stakingLimit || '0'),
    stakingLimitEndTimestamp: (numberSecondsForUserLimit || 0) + (startTimestamp || 0),
  }
}

export const getTokenPricesFromFarm = (
  farms: {
    quoteToken: { address: string }
    token: { address: string }
    quoteTokenPriceBusd: string
    tokenPriceBusd: string
  }[],
) => {
  return farms.reduce((prices, farm) => {
    const quoteTokenAddress = safeGetAddress(farm.quoteToken.address)
    const tokenAddress = safeGetAddress(farm.token.address)
    /* eslint-disable no-param-reassign */
    if (quoteTokenAddress && !prices[quoteTokenAddress]) {
      prices[quoteTokenAddress] = new BigNumber(farm.quoteTokenPriceBusd).toNumber()
    }
    if (tokenAddress && !prices[tokenAddress]) {
      prices[tokenAddress] = new BigNumber(farm.tokenPriceBusd).toNumber()
    }
    /* eslint-enable no-param-reassign */
    return prices
  }, {})
}
