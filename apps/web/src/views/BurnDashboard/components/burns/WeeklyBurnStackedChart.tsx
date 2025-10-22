import { useTranslation } from '@pancakeswap/localization'
import { CardProps, DotIcon, FlexGap, InfoIcon, QuestionHelperV2, Text } from '@pancakeswap/uikit'
import { LightGreyCard } from 'components/Card'
import groupBy from 'lodash/groupBy'
import { useCallback, useMemo, useState } from 'react'
import { Bar, BarChart, ResponsiveContainer, Tooltip, TooltipProps, XAxis, YAxis } from 'recharts'
import { formatAmount } from 'utils/formatInfoNumbers'
import { CHART_COLORS } from 'views/BurnDashboard/constants'
import { useBurnStats } from 'views/BurnDashboard/hooks/useBurnStats'
import { getBurnInfoPrecision } from 'views/BurnDashboard/utils'
import { StatsCard, StatsCardHeader } from '../StatsCard'
import { TooltipCard } from '../styles'
import { TabMenu } from '../TabMenu'

const TIME_FILTERS = {
  '3m': 3 * 30 * 24 * 60 * 60 * 1000,
  '6m': 6 * 30 * 24 * 60 * 60 * 1000,
  '1y': 365 * 24 * 60 * 60 * 1000,
} as const

type CustomTooltipProps = TooltipProps<number, string> & { isUSD?: boolean }

const CustomTooltip = ({ active, payload, isUSD }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const total = payload.reduce((acc, entry) => acc + (entry.value || 0), 0)
    return (
      <TooltipCard>
        <FlexGap mb="8px" justifyContent="space-between" alignItems="center" gap="16px">
          <Text small>
            {new Date(payload[0].payload.timestamp).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </Text>
          <Text color="secondary" small bold>
            {isUSD
              ? `$${formatAmount(total, { precision: 2 })}`
              : formatAmount(total, { precision: getBurnInfoPrecision(total) })}
          </Text>
        </FlexGap>
        {payload.map((entry) => (
          <FlexGap justifyContent="space-between" gap="16px" key={entry.name}>
            <FlexGap key={entry.name} alignItems="center" gap="6px" mb="4px">
              <DotIcon color={entry.color} width="8px" mt="2px" />
              <Text small>{entry.name}</Text>
            </FlexGap>
            <Text small bold>
              {entry.value &&
                (isUSD
                  ? `$${formatAmount(entry.value, { precision: getBurnInfoPrecision(entry.value) })}`
                  : formatAmount(entry.value, { precision: getBurnInfoPrecision(entry.value) }))}
            </Text>
          </FlexGap>
        ))}
      </TooltipCard>
    )
  }
  return null
}

export const WeeklyBurnStackedChart = (props: CardProps) => {
  const { t } = useTranslation()
  const [selectedTab, setSelectedTab] = useState('3m')
  const [selectedCurrency, setSelectedCurrency] = useState('CAKE')

  const { data } = useBurnStats()
  const { burnTimeSeries } = data || {}

  const uniqueProducts = useMemo(() => {
    if (!burnTimeSeries) return new Set<string>()
    return new Set(burnTimeSeries.map(({ product }) => product))
  }, [burnTimeSeries])

  const chartData = useMemo(() => {
    if (!burnTimeSeries) return []

    const now = Date.now()
    const startTime = selectedTab === 'Max' ? 0 : now - (TIME_FILTERS[selectedTab] || TIME_FILTERS['3m'])

    const filteredData = burnTimeSeries.filter((item) => item.timestamp >= startTime)
    const groupedByTimestamp = groupBy(filteredData, 'timestamp')

    return Object.entries(groupedByTimestamp).map(([timestamp, items]) => {
      const row = {
        timestamp: Number(timestamp),
        timestampFormatted: new Date(Number(timestamp)).toLocaleDateString('en-US', {
          ...(selectedTab !== '3m' && { year: 'numeric' }),
          month: 'short',
          day: selectedTab === 'Max' ? undefined : 'numeric',
        }),
      }

      items.forEach(({ product, burn, burnUSD }) => {
        row[product] = selectedCurrency === 'USD' ? burnUSD : burn
      })
      return row
    })
  }, [burnTimeSeries, selectedTab, selectedCurrency])

  const handleTabChange = useCallback((tab: string) => {
    setSelectedTab(tab)
  }, [])

  const handleCurrencyChange = useCallback((tab: string) => {
    setSelectedCurrency(tab)
  }, [])

  return (
    <StatsCard {...props}>
      <FlexGap mb="16px" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap="8px">
        <FlexGap gap="6px" alignItems="center">
          <StatsCardHeader>{t('Weekly Burn')}</StatsCardHeader>
          <QuestionHelperV2 text={t('Weekly breakdown of CAKE burn by product')} placement="top">
            <InfoIcon color="textSubtle" />
          </QuestionHelperV2>
        </FlexGap>
        <FlexGap gap="8px" flexWrap="wrap">
          <TabMenu tabs={['CAKE', 'USD']} defaultTab="CAKE" onTabChange={handleCurrencyChange} />
          <TabMenu tabs={['3m', '6m', '1y', 'Max']} defaultTab="3m" onTabChange={handleTabChange} />
        </FlexGap>
      </FlexGap>

      <ResponsiveContainer width="100%" height={360}>
        <BarChart data={chartData} barCategoryGap="95%" barSize={20}>
          <XAxis
            dataKey="timestampFormatted"
            fontSize="12px"
            tick={{ fill: '#9383B4' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            fontSize="12px"
            tick={{ fill: '#9383B4' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => {
              const formattedValue = formatAmount(value, { precision: getBurnInfoPrecision(value) }) || '0'
              return selectedCurrency === 'USD' ? `$${formattedValue}` : formattedValue
            }}
          />
          <Tooltip
            cursor={{ fill: 'transparent' }}
            wrapperStyle={{ outline: 'none' }}
            content={(tooltipProps) => (
              <CustomTooltip {...(tooltipProps as TooltipProps<number, string>)} isUSD={selectedCurrency === 'USD'} />
            )}
          />
          {Array.from(uniqueProducts).map((product, index) => (
            <Bar
              dataKey={product}
              fill={CHART_COLORS[index % CHART_COLORS.length]}
              stackId="stack"
              radius={index === 0 ? [0, 0, 4, 4] : index === uniqueProducts.size - 1 ? [4, 4, 0, 0] : undefined}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>

      <LightGreyCard mx="auto" padding="8px 16px" width="fit-content" height="fit-content">
        <FlexGap gap="16px" flexWrap="wrap">
          {Array.from(uniqueProducts).map((product, index) => (
            <FlexGap key={product} alignItems="center" gap="4px">
              <DotIcon color={CHART_COLORS[index % CHART_COLORS.length]} width="12px" />
              <Text color="textSubtle" width="max-content" small>
                {product}
              </Text>
            </FlexGap>
          ))}
        </FlexGap>
      </LightGreyCard>
    </StatsCard>
  )
}
