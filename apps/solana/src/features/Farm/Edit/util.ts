import { ApiV3Token } from '@pancakeswap/solana-core-sdk'
import { FormattedRewardInfoV6 } from '@/hooks/farm/type'
import { FormattedPoolReward } from '@/hooks/pool/type'
import { parseDateInfo } from '@/utils/date'
import parseDuration from '@/utils/duration'

export type FarmStatus = 'ongoing' | 'ended' | 'updated' | 'new' | undefined
export interface EditReward {
  mint: ApiV3Token
  total: string
  openTime: number
  endTime: number
  perWeek: string
  perDay: string
  status: FarmStatus
  apr: number
}

export const getFarmStatus = (reward: FormattedRewardInfoV6 | FormattedPoolReward): FarmStatus =>
  reward.ongoing ? 'ongoing' : reward.ended ? 'ended' : undefined

export function farmV6RewardToEditReward(reward: FormattedRewardInfoV6): EditReward {
  return {
    mint: reward.mint,
    total: reward.totalRewards,
    openTime: Number(reward.openTime),
    endTime: Number(reward.endTime),
    perWeek: reward.weekly,
    perDay: reward.daily,
    status: getFarmStatus(reward),
    apr: reward.apr
  }
}

export function poolRewardToEditReward(reward: FormattedPoolReward): EditReward {
  return {
    mint: reward.mint,
    total: reward.totalRewards,
    openTime: reward.startTime!,
    endTime: reward.endTime!,
    perWeek: reward.weekly,
    perDay: reward.daily,
    status: getFarmStatus(reward),
    apr: reward.apr
  }
}

export function getRewardMeta(reward: EditReward) {
  const startTimeInfo = parseDateInfo(reward.openTime)
  const startDateText = reward.openTime ? `${startTimeInfo.year}/${startTimeInfo.month}/${startTimeInfo.day}` : undefined
  const startTimeText = reward.openTime ? `${startTimeInfo.hour}:${startTimeInfo.minutes}` : undefined

  const endTimeInfo = parseDateInfo(reward.endTime)
  const endDateText = reward.endTime ? `${endTimeInfo.year}/${endTimeInfo.month}/${endTimeInfo.day}` : undefined
  const endTimeText = reward.endTime ? `${endTimeInfo.hour}:${endTimeInfo.minutes}` : undefined

  const duration = parseDuration(reward.endTime - reward.openTime)
  const durationText = `${duration.days}D${duration.hours ? ` ${duration.hours}H` : ''}`

  return {
    startDateText,
    startTimeText,
    endDateText,
    endTimeText,
    durationText
  }
}
