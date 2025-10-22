import { useMemo } from 'react'
import { formatAmount } from '@pancakeswap/utils/formatFractions'
import { useIFODuration } from './ifo/useIFODuration'
import { useIfoTimeDisplay } from './ifo/useIfoTimeDisplay'
import useIfo from './useIfo'
import type { IfoDisplay, IfoPoolDisplay } from '../ifov2.types'

export const useIfoDisplay = (): IfoDisplay => {
  const { info, pools } = useIfo()

  const { duration, startTimestamp, endTimestamp } = info

  const startDisplay = useIfoTimeDisplay(startTimestamp)
  const endDisplay = useIfoTimeDisplay(endTimestamp)
  const preSaleDurationText = useIFODuration(duration)

  const poolsDisplay: IfoPoolDisplay[] = useMemo(
    () =>
      pools.map((pool) => ({
        flatTaxRate: Number(pool.flatTaxRate) / 1e8,
        totalCommittedPercent:
          pool.raisingAmountPool > 0n
            ? ((Number(pool.totalAmountPool) / Number(pool.raisingAmountPool)) * 100).toFixed(2)
            : '0.00',
        raiseAmountText: pool.raise ? `${formatAmount(pool.raise, 6)} ${pool.raise.currency.symbol}` : '',
      })),
    [pools],
  )

  return { startDisplay, endDisplay, preSaleDurationText, pools: poolsDisplay }
}
