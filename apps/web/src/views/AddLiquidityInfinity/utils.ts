import { Liquidity } from '@pancakeswap/widgets-internal'
import { TickFormat } from '@pancakeswap/widgets-internal/components/PriceRangeChartWithPeriodAndLiquidity/AxisBottom'
import { BigNumber as BN } from 'bignumber.js'
import { timeDay, timeFormat, timeHour, timeMinute } from 'd3'

export const checkIsPriceFullRange = (price?: string) => {
  if (!price) return false
  return BN(price).eq(0) || BN(price).eq(Infinity)
}

const axisBottomFormat: (period: Liquidity.PresetRangeItem['value']) => TickFormat =
  (period) => (d, idx, ticksValue) => {
    const date = d instanceof Date ? d : new Date(d.toString())
    const withinADay = ['1H', '1D'].includes(period)
    const label = timeFormat(withinADay ? '%H:%M' : '%d')(date)
    if (idx === 0 || idx === ticksValue.length - 1) {
      return [label, timeFormat(withinADay ? '%d %b' : '%b')(date).toUpperCase()].join('\n')
    }
    return label
  }

const AXIS_TICKS_PERIOD_MAP = {
  '1M': timeDay.every(5),
  '1W': timeDay.every(1),
  '1D': timeHour.every(4),
  '1H': timeMinute.every(10),
}

const MOBILE_AXIS_TICKS_PERIOD_MAP = {
  '1M': timeDay.every(8),
  '1W': timeDay.every(2),
  '1D': timeHour.every(6),
  '1H': timeMinute.every(15),
}
export const getAxisTicks = (period: Liquidity.PresetRangeItem['value'], isMobile = false) => ({
  bottomTicks: isMobile ? MOBILE_AXIS_TICKS_PERIOD_MAP[period] : AXIS_TICKS_PERIOD_MAP[period],
  bottomFormat: axisBottomFormat(period),
})
