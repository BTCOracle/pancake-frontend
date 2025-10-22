import { useTheme } from '@pancakeswap/hooks'
import { Flex, Text } from '@pancakeswap/uikit'
import dayjs from 'dayjs'
import { useMemo, useState } from 'react'
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis } from 'recharts'
import { PoolInfo } from 'state/farmsV4/state/type'
import styled from 'styled-components'
import { formatDollarAmount } from 'views/V3Info/utils/numbers'
import { usePoolChartVolumeData } from '../hooks/usePoolChartVolumeData'
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

type ChartVolumeProps = {
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

export const ChartVolume: React.FC<ChartVolumeProps> = ({ address, poolInfo, timeFilter }) => {
  const { data: initialData } = usePoolChartVolumeData(
    address,
    poolInfo?.protocol,
    TIME_FILTERS_MAPPING[timeFilter ?? TimeFilter.D],
  )
  const [latestValue, setLatestValue] = useState<number | undefined>()
  const [valueLabel, setValueLabel] = useState<string | undefined>()
  const [activeIndex, setActiveIndex] = useState<number | undefined>()

  // NOTE: Remove first item due to API returning extraordinarily large value. See PAN-6994.
  const data = useMemo(() => {
    if (!initialData) return []
    if (initialData.length === 1) return initialData
    return initialData.slice(1)
  }, [initialData])

  const { theme } = useTheme()

  const totalSum = useMemo(() => {
    if (!data || data.length === 0) return 0
    return data.reduce((sum, item) => sum + item.value, 0)
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
          {formatDollarAmount(latestValue ?? totalSum)}
        </Text>
        <Text small color="secondary">
          {latestValue ? `${dayjs(valueLabel).format('MMM D, YYYY')} (UTC)` : `${dateRange} (UTC)`}
        </Text>
      </Flex>
      <ResponsiveContainer width="100%" height={340}>
        <BarChart
          data={chartData}
          margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
          onMouseMove={(state) => {
            if (state?.activePayload?.[0]?.payload) {
              setLatestValue(state.activePayload[0].payload.value)
              setValueLabel(state.activePayload[0].payload.time)
              setActiveIndex(state.activeTooltipIndex)
            }
          }}
          onMouseLeave={() => {
            setLatestValue(undefined)
            setValueLabel(undefined)
            setActiveIndex(undefined)
          }}
        >
          <XAxis dataKey="formattedTime" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9383B4' }} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} wrapperStyle={{ outline: 'none' }} />
          <Bar dataKey="value" radius={[16, 16, 16, 16]} maxBarSize={20}>
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={theme.colors.primary}
                fillOpacity={activeIndex === undefined ? 1 : activeIndex === index ? 1 : 0.3}
                style={{ transition: 'fill-opacity 0.2s ease' }}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </>
  )
}
