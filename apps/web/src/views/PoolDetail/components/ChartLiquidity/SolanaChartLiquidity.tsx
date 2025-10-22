import { useMemo, useState } from 'react'
import dayjs from 'dayjs'
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis } from 'recharts'
import { useTheme } from '@pancakeswap/hooks'
import { Text } from '@pancakeswap/uikit'
import styled from 'styled-components'

import { formatDollarAmount } from 'views/V3Info/utils/numbers'
import { useSolanaPoolChartVolumeData } from 'views/PoolDetail/hooks/useSolanaChartData'

const TooltipCard = styled.div`
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border-radius: 12px;
  padding: 16px;
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 200px;
  z-index: 10;
`

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <TooltipCard>
        <Text small color="textSubtle">
          {dayjs(Number(data.time) * 1000).format('MMM D, YYYY, HH:mm A')} UTC
        </Text>
        <Text bold>{data.value}</Text>
      </TooltipCard>
    )
  }
  return null
}

export function SolanaChartLiquidity({ address }: { address?: string }) {
  const { theme } = useTheme()
  const { data } = useSolanaPoolChartVolumeData(address)
  const chartData = useMemo(
    () =>
      data?.map((item) => ({
        time: item.time,
        value: item.value,
        formattedTime: dayjs(item.time).format('MMM D'),
      })) || [],
    [data],
  )
  const [activeIndex, setActiveIndex] = useState<number | undefined>()

  return (
    <ResponsiveContainer width="100%" height={340}>
      <BarChart
        data={chartData}
        margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
        onMouseMove={(state) => {
          if (state?.activePayload?.[0]?.payload) {
            setActiveIndex(state.activeTooltipIndex)
          }
        }}
        onMouseLeave={() => {
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
  )
}
