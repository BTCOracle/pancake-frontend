import type { IfoStatus } from '@pancakeswap/ifos'
import { type Currency, CurrencyAmount, Price } from '@pancakeswap/swap-sdk-core'
import dayjs from 'dayjs'
import { useMemo } from 'react'
import { getStatusByTimestamp } from '../helpers'
import { useIDOCurrencies } from './useIDOCurrencies'
import { useIDOPoolInfo } from './useIDOPoolInfo'

export type IDOConfig = {
  totalSales: [bigint, bigint]
  startTimestamp: number
  endTimestamp: number
  duration: number
  pricePerTokens: [Price<Currency, Currency> | undefined, Price<Currency, Currency> | undefined]
  maxStakePerUsers: [CurrencyAmount<Currency> | undefined, CurrencyAmount<Currency> | undefined]
  raiseAmounts: [CurrencyAmount<Currency> | undefined, CurrencyAmount<Currency> | undefined]
  saleAmounts: [CurrencyAmount<Currency> | undefined, CurrencyAmount<Currency> | undefined]
  totalSalesAmount: CurrencyAmount<Currency> | undefined
  status: IfoStatus
}

export const useIDOConfig = () => {
  const { data: poolInfo } = useIDOPoolInfo()
  const { pool0Info, pool1Info } = poolInfo ?? {}
  const { stakeCurrency0, stakeCurrency1, offeringCurrency } = useIDOCurrencies()
  const now = dayjs().unix()

  return useMemo(() => {
    return {
      totalSales: [pool0Info?.offeringAmountPool ?? 0n, pool1Info?.offeringAmountPool ?? 0n],
      startTimestamp: poolInfo?.startTimestamp ?? 0,
      endTimestamp: poolInfo?.endTimestamp ?? 0,
      duration:
        poolInfo?.endTimestamp && poolInfo?.startTimestamp ? poolInfo?.endTimestamp - poolInfo?.startTimestamp : 0,
      pricePerTokens: [
        stakeCurrency0 && offeringCurrency
          ? new Price(
              offeringCurrency,
              stakeCurrency0,
              pool0Info?.offeringAmountPool ?? 0n,
              pool0Info?.raisingAmountPool ?? 0n,
            )
          : undefined,
        stakeCurrency1 && offeringCurrency
          ? new Price(
              offeringCurrency,
              stakeCurrency1,
              pool1Info?.offeringAmountPool ?? 0n,
              pool1Info?.raisingAmountPool ?? 0n,
            )
          : undefined,
      ],
      maxStakePerUsers: [
        stakeCurrency0 ? CurrencyAmount.fromRawAmount(stakeCurrency0, pool0Info?.capPerUserInLP ?? 0n) : undefined,
        stakeCurrency1 ? CurrencyAmount.fromRawAmount(stakeCurrency1, pool1Info?.capPerUserInLP ?? 0n) : undefined,
      ],
      raiseAmounts: [
        stakeCurrency0 ? CurrencyAmount.fromRawAmount(stakeCurrency0, pool0Info?.raisingAmountPool ?? 0n) : undefined,
        stakeCurrency1 ? CurrencyAmount.fromRawAmount(stakeCurrency1, pool1Info?.raisingAmountPool ?? 0n) : undefined,
      ],
      saleAmounts: offeringCurrency
        ? [
            CurrencyAmount.fromRawAmount(offeringCurrency, pool0Info?.offeringAmountPool ?? 0n),
            CurrencyAmount.fromRawAmount(offeringCurrency, pool1Info?.offeringAmountPool ?? 0n),
          ]
        : [undefined, undefined],
      totalSalesAmount: offeringCurrency
        ? CurrencyAmount.fromRawAmount(offeringCurrency, pool0Info?.offeringAmountPool ?? 0n).add(
            CurrencyAmount.fromRawAmount(offeringCurrency, pool1Info?.offeringAmountPool ?? 0n),
          )
        : undefined,
      status: getStatusByTimestamp(now, poolInfo?.startTimestamp, poolInfo?.endTimestamp),
    } satisfies IDOConfig
  }, [
    pool0Info?.offeringAmountPool,
    pool0Info?.raisingAmountPool,
    pool0Info?.capPerUserInLP,
    pool1Info?.offeringAmountPool,
    pool1Info?.raisingAmountPool,
    pool1Info?.capPerUserInLP,
    poolInfo?.startTimestamp,
    poolInfo?.endTimestamp,
    stakeCurrency0,
    offeringCurrency,
    stakeCurrency1,
    now,
  ])
}
