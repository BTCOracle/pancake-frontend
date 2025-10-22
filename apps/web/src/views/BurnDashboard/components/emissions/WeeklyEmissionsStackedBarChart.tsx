import { useTranslation } from '@pancakeswap/localization'
import { CardProps, DotIcon, FlexGap, InfoIcon, QuestionHelperV2, Text } from '@pancakeswap/uikit'
import { LightGreyCard } from 'components/Card'
import groupBy from 'lodash/groupBy'
import { useCallback, useMemo, useState } from 'react'
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatAmount } from 'utils/formatInfoNumbers'
import { CHART_COLORS_ALTERNATE } from 'views/BurnDashboard/constants'
import { useBurnStats } from 'views/BurnDashboard/hooks/useBurnStats'
import { getBurnInfoPrecision } from 'views/BurnDashboard/utils'
import { StatsCard, StatsCardHeader } from '../StatsCard'
import { TooltipCard } from '../styles'
import { TabMenu } from '../TabMenu'

// Constants
const TIME_FILTERS = {
  '3m': 90 * 24 * 60 * 60 * 1000,
  '6m': 180 * 24 * 60 * 60 * 1000,
  '1y': 365 * 24 * 60 * 60 * 1000,
} as const

type TimeFilterKey = keyof typeof TIME_FILTERS | 'Max'
type CurrencyTab = 'CAKE' | 'USD'

// Memoized tooltip component
const CustomTooltip = ({ active, payload, isUSD }: { active?: boolean; payload?: any[]; isUSD: boolean }) => {
  if (!active || !payload?.length) return null

  const total = payload.reduce((acc, entry) => acc + entry.value, 0)
  const date = new Date(Number(payload[0].payload.timestamp))

  return (
    <TooltipCard>
      <FlexGap mb="8px" justifyContent="space-between" alignItems="center" gap="16px">
        <Text small>
          {date.toLocaleDateString('en-US', {
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
          <FlexGap alignItems="center" gap="6px" mb="4px">
            <DotIcon color={entry.color} width="8px" mt="2px" />
            <Text small>{entry.name}</Text>
          </FlexGap>
          <Text small bold>
            {isUSD
              ? `$${formatAmount(entry.value, { precision: 2 })}`
              : formatAmount(entry.value, { precision: getBurnInfoPrecision(entry.value) })}
          </Text>
        </FlexGap>
      ))}
    </TooltipCard>
  )
}

export const WeeklyEmissionsStackedBarChart = (props: CardProps) => {
  const { t } = useTranslation()
  const [currencyTab, setCurrencyTab] = useState<CurrencyTab>('CAKE')
  const [timeTab, setTimeTab] = useState<TimeFilterKey>('3m')

  const { data } = useBurnStats()
  const mintTimeSeries = data?.mintTimeSeries

  // Extract unique products once
  const uniqueProducts = useMemo(() => {
    if (!mintTimeSeries) return []
    return [...new Set(mintTimeSeries.map((item) => item.product))]
  }, [mintTimeSeries])

  // Format date based on time tab
  const formatDate = useCallback(
    (timestamp: number) => {
      return new Date(timestamp).toLocaleDateString('en-US', {
        month: 'short',
        day: timeTab === 'Max' ? undefined : 'numeric',
        ...(timeTab !== '3m' && { year: 'numeric' }),
      })
    },
    [timeTab],
  )

  // Process chart data
  const chartData = useMemo(() => {
    if (!mintTimeSeries) return []

    const groupedData = groupBy(mintTimeSeries, 'timestamp')
    const now = Date.now()

    return Object.entries(groupedData)
      .filter(([timestamp]) => {
        const timeDiff = now - Number(timestamp)
        return timeTab === 'Max' ? true : timeDiff <= TIME_FILTERS[timeTab as keyof typeof TIME_FILTERS]
      })
      .map(([timestamp, items]) => {
        const baseData = {
          timestamp,
          timestampFormatted: formatDate(Number(timestamp)),
          ...items.reduce((acc, item) => {
            const newAcc = { ...acc }
            const value = currencyTab === 'USD' ? item.mintUSD : item.mint
            newAcc[item.product] = value
            return newAcc
          }, {}),
        }
        return baseData
      })
      .sort((a, b) => Number(a.timestamp) - Number(b.timestamp))
  }, [mintTimeSeries, timeTab, currencyTab, formatDate])

  // Memoize the legend items
  const legendItems = useMemo(
    () => (
      <LightGreyCard padding="8px 16px" width="fit-content" height="fit-content">
        <FlexGap flexDirection={['row', 'row', 'row', 'row', 'column']} gap="8px" flexWrap="wrap">
          {uniqueProducts.map((product, index) => (
            <FlexGap alignItems="center" gap="4px" key={product}>
              <DotIcon color={CHART_COLORS_ALTERNATE[index % CHART_COLORS_ALTERNATE.length]} width="12px" />
              <Text color="textSubtle" width="max-content" small>
                {product}
              </Text>
            </FlexGap>
          ))}
        </FlexGap>
      </LightGreyCard>
    ),
    [uniqueProducts],
  )

  return (
    <StatsCard {...props}>
      <FlexGap justifyContent="space-between" alignItems="center" gap="8px" flexWrap="wrap">
        <FlexGap gap="6px" alignItems="center">
          <StatsCardHeader>{t('Weekly Emissions Allocation')}</StatsCardHeader>
          <QuestionHelperV2 text={t('Weekly breakdown of CAKE emissions allocation by product')} placement="top">
            <InfoIcon color="textSubtle" />
          </QuestionHelperV2>
        </FlexGap>
        <FlexGap gap="6px" alignItems="center" flexWrap="wrap">
          <TabMenu
            tabs={['CAKE', 'USD']}
            defaultTab={currencyTab}
            onTabChange={(tab) => setCurrencyTab(tab as CurrencyTab)}
          />
          <TabMenu
            tabs={['3m', '6m', '1y', 'Max']}
            defaultTab={timeTab}
            onTabChange={(tab) => setTimeTab(tab as TimeFilterKey)}
          />
        </FlexGap>
      </FlexGap>

      <FlexGap mt="24px" height="100%" flexWrap={['wrap', 'wrap', 'wrap', 'wrap', 'nowrap']}>
        <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={300}>
          <BarChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
            barSize={20}
          >
            {uniqueProducts.map((product, index) => (
              <Bar
                dataKey={product}
                fill={CHART_COLORS_ALTERNATE[index % CHART_COLORS_ALTERNATE.length]}
                stackId="stack"
                radius={index === 0 ? [0, 0, 4, 4] : index === uniqueProducts.length - 1 ? [4, 4, 0, 0] : undefined}
              />
            ))}
            <Tooltip
              content={<CustomTooltip isUSD={currencyTab === 'USD'} />}
              cursor={{ fill: 'transparent' }}
              wrapperStyle={{ outline: 'none' }}
            />
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
              tickFormatter={(value) =>
                currencyTab === 'USD'
                  ? `$${formatAmount(value, { precision: 2 })}`
                  : formatAmount(value, { precision: getBurnInfoPrecision(value) }) || value
              }
            />
          </BarChart>
        </ResponsiveContainer>
        {legendItems}
      </FlexGap>
    </StatsCard>
  )
}
