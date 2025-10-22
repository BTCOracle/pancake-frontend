import { ChainId } from '@pancakeswap/chains'
import { RewardProvider, RewardConfig } from './types'

export const rewardConfig: Partial<Record<ChainId, RewardConfig[]>> = {
  [ChainId.BSC]: [
    {
      poolAddress: '0xdc35157217A3AeFF3dcaF2e86327254FBF9f4601',
      rewardProvider: RewardProvider.Ethena,
      multiplier: 30,
    },
    {
      poolAddress: '0x345E7D44E1eb8894b4524Cfc918906718bc1FFe2',
      rewardProvider: RewardProvider.Ethena,
      multiplier: 30,
    },
    {
      poolAddress: '0xE38B4d4Dc90E6a0859bEE047689d97db7fD94621',
      rewardProvider: RewardProvider.Falcon,
      multiplier: 40,
    },
    {
      poolAddress: '0x24618d12b5eA15bB6fe3c81bBb9E011b5D5b107c',
      rewardProvider: RewardProvider.Falcon,
      multiplier: 40,
    },
  ],
  [ChainId.ETHEREUM]: [
    {
      poolAddress: '0x0d9EA0D5E3f400b1df8F695be04292308c041E77',
      rewardProvider: RewardProvider.Falcon,
      multiplier: 40,
    },
  ],
}
