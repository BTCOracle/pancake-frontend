import { type Currency, CurrencyAmount, Percent } from '@pancakeswap/swap-sdk-core'
import { useMemo } from 'react'
import { useIDOCurrencies } from './useIDOCurrencies'
import { useIDOPoolInfo } from './useIDOPoolInfo'

export type IDOStatus = {
  progress: Percent
  currentStakedAmount: CurrencyAmount<Currency> | undefined
}

export const useIDOStatus = (): [IDOStatus, IDOStatus] => {
  const { stakeCurrency0, stakeCurrency1 } = useIDOCurrencies()
  const { data: poolInfo } = useIDOPoolInfo()
  const progresses = useMemo(() => {
    return [
      poolInfo?.pool0Info
        ? new Percent(poolInfo.pool0Info.totalAmountPool, poolInfo.pool0Info.raisingAmountPool)
        : new Percent(0, 100),
      poolInfo?.pool1Info
        ? new Percent(poolInfo.pool1Info.totalAmountPool, poolInfo.pool1Info.raisingAmountPool)
        : new Percent(0, 100),
    ]
  }, [poolInfo])

  const currentStakedAmounts = useMemo(() => {
    return [
      stakeCurrency0 && poolInfo?.pool0Info
        ? CurrencyAmount.fromRawAmount(stakeCurrency0, poolInfo.pool0Info.totalAmountPool)
        : undefined,
      stakeCurrency1 && poolInfo?.pool1Info
        ? CurrencyAmount.fromRawAmount(stakeCurrency1, poolInfo.pool1Info.totalAmountPool)
        : undefined,
    ]
  }, [poolInfo, stakeCurrency0, stakeCurrency1])

  return [
    {
      progress: progresses[0],
      currentStakedAmount: currentStakedAmounts[0],
    },
    {
      progress: progresses[1],
      currentStakedAmount: currentStakedAmounts[1],
    },
  ]
}
