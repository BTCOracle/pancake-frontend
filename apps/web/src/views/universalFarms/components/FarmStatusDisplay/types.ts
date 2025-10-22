export enum RewardProvider {
  Ethena = 1,
  Falcon = 2,
}

export interface RewardConfig {
  poolAddress: string
  rewardProvider: RewardProvider
  multiplier: number
}
