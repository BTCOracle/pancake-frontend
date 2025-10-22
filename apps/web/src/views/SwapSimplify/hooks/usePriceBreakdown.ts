import { useMemo } from 'react'
import { type PriceOrder } from '@pancakeswap/price-api-sdk'
import { getPriceBreakdown } from '../../Swap/utils'

export const usePriceBreakdown = (order?: PriceOrder) => {
  return useMemo(() => getPriceBreakdown(order), [order])
}
