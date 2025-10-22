import { ChainId } from '@pancakeswap/chains'
import memoize from 'lodash/memoize'
import { isAddressEqual } from 'utils'
import { rewardConfig } from './config'
import { RewardProvider, RewardConfig } from './types'

// Pure function to check if a farm has rewards
export const getRewardConfig = memoize(
  (chainId?: ChainId, poolAddress?: string): RewardConfig | undefined => {
    if (!chainId || !poolAddress) return undefined
    const chainConfig = rewardConfig[chainId]
    if (!chainConfig) return undefined

    return chainConfig.find((config) => isAddressEqual(config.poolAddress, poolAddress))
  },
  (chainId, poolAddress) => `${chainId}#${poolAddress}`,
)

export const getRewardProvider = memoize(
  (chainId?: ChainId, poolAddress?: string): RewardProvider | undefined => {
    return getRewardConfig(chainId, poolAddress)?.rewardProvider
  },
  (chainId, poolAddress) => `${chainId}#${poolAddress}`,
)

export const getRewardMultiplier = memoize(
  (chainId?: ChainId, poolAddress?: string): number | undefined => {
    return getRewardConfig(chainId, poolAddress)?.multiplier
  },
  (chainId, poolAddress) => `${chainId}#${poolAddress}`,
)
