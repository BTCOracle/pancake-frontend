import { useTheme } from '@pancakeswap/hooks'
import { Flex, Text } from '@pancakeswap/uikit'
import dayjs from 'dayjs'
import { useMemo, useState } from 'react'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { PoolInfo } from 'state/farmsV4/state/type'
import styled from 'styled-components'
import { formatDollarAmount } from 'views/V3Info/utils/numbers'
import { usePoolChartTVLData } from '../hooks/usePoolChartTVLData'
import { TIME_FILTERS_MAPPING, TimeFilter } from '../types'

const TooltipCard = styled.div`
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border-radius: 12px;
  padding: 16px;
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 200px;
  z-index: 10;
`

type ChartTVLProps = {
  address?: string
  poolInfo?: PoolInfo | null
  timeFilter?: TimeFilter
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <TooltipCard>
        <Text small color="textSubtle">
          {dayjs(data.time).format('MMM D, YYYY, HH:mm A')} UTC
        </Text>
        <Text bold>{formatDollarAmount(data.value)}</Text>
      </TooltipCard>
    )
  }
  return null
}

export const ChartTVL: React.FC<ChartTVLProps> = ({ address, poolInfo, timeFilter }) => {
  const { data } = usePoolChartTVLData(address, poolInfo?.protocol, TIME_FILTERS_MAPPING[timeFilter ?? TimeFilter.D])
  const [hoverValue, setHoverValue] = useState<number | undefined>()
  const [hoverDate, setHoverDate] = useState<string | undefined>()
  const { theme } = useTheme()

  const latestValue = useMemo(() => {
    if (!data || data.length === 0) return 0
    return data[data.length - 1].value
  }, [data])

  // Get date range for when not hovering
  const dateRange = useMemo(() => {
    if (!data || data.length === 0) return ''
    const startDate = dayjs(data[0].time).format('MMM D, YYYY')
    const endDate = dayjs(data[data.length - 1].time).format('MMM D, YYYY')
    return startDate === endDate ? startDate : `${startDate} - ${endDate}`
  }, [data])

  // Transform data for recharts
  const chartData = useMemo(
    () =>
      data?.map((item) => ({
        time: item.time,
        value: item.value,
        formattedTime:
          timeFilter === TimeFilter.D ? dayjs(item.time).format('HH:mm') : dayjs(item.time).format('MMM D'),
      })) || [],
    [data, timeFilter],
  )

  return (
    <>
      <Flex mb="24px" flexDirection="column">
        <Text bold fontSize={24}>
          {formatDollarAmount(hoverValue ?? latestValue)}
        </Text>
        <Text small color="secondary">
          {hoverValue ? `${dayjs(hoverDate).format('MMM D, YYYY')} (UTC)` : `${dateRange} (UTC)`}
        </Text>
      </Flex>
      <ResponsiveContainer width="100%" height={340}>
        <AreaChart
          data={chartData}
          margin={{ top: 20, right: 20, left: 20, bottom: 40 }}
          onMouseMove={(state) => {
            if (state?.activePayload?.[0]?.payload) {
              setHoverValue(state.activePayload[0].payload.value)
              setHoverDate(state.activePayload[0].payload.time)
            }
          }}
          onMouseLeave={() => {
            setHoverValue(undefined)
            setHoverDate(undefined)
          }}
        >
          <defs>
            <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={theme.colors.primary} stopOpacity={1} />
              <stop offset="100%" stopColor={theme.colors.primary} stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <XAxis dataKey="formattedTime" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9383B4' }} />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#9383B4' }}
            tickFormatter={(value) => {
              if (value >= 1000000) {
                return `${(value / 1000000).toFixed(2)}M`
              }
              if (value >= 1000) {
                return `${(value / 1000).toFixed(2)}K`
              }
              return formatDollarAmount(value)
            }}
            orientation="right"
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
          <Area
            type="monotone"
            dataKey="value"
            stroke={theme.colors.primary}
            fill="url(#colorGradient)"
            strokeWidth={3}
          />
        </AreaChart>
      </ResponsiveContainer>
    </>
  )
}
