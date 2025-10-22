import { IfoStatus } from '@pancakeswap/ifos'
import { type Currency, CurrencyAmount, Percent, Price } from '@pancakeswap/swap-sdk-core'
import { UnsafeCurrency } from 'config/constants/types'
import { getStatusByTimestamp } from '../helpers'
import { useIFOStatus } from './useIFOStatus'
import type { PoolInfo } from '../../ifov2.types'
import useIfo from '../useIfo'

export type IFOPublicData = {
  startTime: number
  endTime: number
  status: IfoStatus
  // currencyPriceInUSD: BigNumber
  poolInfo?: PoolInfo
  plannedStartTime: number
  progress: Percent
  currentStakedAmount?: CurrencyAmount<Currency>
  maxStakePerUser?: CurrencyAmount<Currency>
  timeProgress: number
  duration: number
  pricePerToken: Price<Currency, Currency> | undefined
  stakeCurrency: UnsafeCurrency
  offeringCurrency: UnsafeCurrency
  raiseAmount: CurrencyAmount<Currency> | undefined
  saleAmount: CurrencyAmount<Currency> | undefined
  userClaimableAmount?: CurrencyAmount<Currency>
  userStakedAmount?: CurrencyAmount<Currency>
  userStakedRefund?: CurrencyAmount<Currency>
  userClaimed?: boolean
}

export const useIfoPublicData = (): [IFOPublicData, IFOPublicData] | [IFOPublicData] => {
  const { pools, info, users } = useIfo()
  const pool0Info = pools[0]
  const pool1Info = pools[1]
  const stakeCurrency0 = pool0Info?.stakeCurrency as UnsafeCurrency
  const stakeCurrency1 = pool1Info?.stakeCurrency as UnsafeCurrency
  const offeringCurrency = info?.offeringCurrency
  const startTimestamp = info?.startTimestamp
  const endTimestamp = info?.endTimestamp
  const [status0, status1] = useIFOStatus()
  const [userStatus0, userStatus1] = users

  const {
    stakedAmount: userStakedAmount,
    stakeRefund: userStakedRefund,
    claimableAmount: userClaimableAmount,
    claimed: userClaimed,
  } = userStatus0 ?? {}

  const startTime = Number(startTimestamp) || 0
  const endTime = Number(endTimestamp) || 0 // 1737407928
  const now = Math.floor(Date.now() / 1000)
  const status = getStatusByTimestamp(now, startTime, endTime)

  const duration = startTime - endTime

  const timeProgress = status === 'live' ? ((now - startTime) / duration) * 100 : 0

  return [
    {
      startTime,
      endTime,
      status,
      poolInfo: pool0Info,
      plannedStartTime: startTimestamp ? startTimestamp - 432000 : 0, // five days before
      progress: status0.progress,
      currentStakedAmount: status0.currentStakedAmount,
      maxStakePerUser: pool0Info?.stakeCurrency
        ? CurrencyAmount.fromRawAmount(pool0Info.stakeCurrency, pool0Info.capPerUserInLP)
        : undefined,
      timeProgress,
      duration,
      pricePerToken: pool0Info?.price,
      stakeCurrency: stakeCurrency0,
      offeringCurrency: offeringCurrency as UnsafeCurrency,
      raiseAmount: pool0Info?.raise,
      saleAmount: pool0Info?.saleAmount,
      userStakedAmount,
      userStakedRefund,
      userClaimableAmount,
      userClaimed,
    },
    {
      startTime,
      endTime,
      status,
      poolInfo: pool1Info,
      plannedStartTime: startTimestamp ? startTimestamp - 432000 : 0, // five days before
      progress: status1.progress,
      currentStakedAmount: status1.currentStakedAmount,
      maxStakePerUser: pool1Info?.stakeCurrency
        ? CurrencyAmount.fromRawAmount(pool1Info.stakeCurrency, pool1Info.capPerUserInLP)
        : undefined,
      timeProgress,
      duration,
      pricePerToken: pool1Info?.price,
      stakeCurrency: stakeCurrency1,
      offeringCurrency: offeringCurrency as UnsafeCurrency,
      raiseAmount: pool1Info?.raise,
      saleAmount: pool1Info?.saleAmount,
      userStakedAmount: userStatus1?.stakedAmount,
      userStakedRefund: userStatus1?.stakeRefund,
      userClaimableAmount: userStatus1?.claimableAmount,
      userClaimed: userStatus1?.claimed,
    },
  ]
}
