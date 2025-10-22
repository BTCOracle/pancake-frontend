import { useTheme } from '@pancakeswap/hooks'
import { useTranslation } from '@pancakeswap/localization'
import { CardProps, DotIcon, FlexGap, InfoIcon, QuestionHelperV2, Text } from '@pancakeswap/uikit'
import { LightGreyCard } from 'components/Card'
import keyBy from 'lodash/keyBy'
import merge from 'lodash/merge'
import values from 'lodash/values'
import { useMemo } from 'react'
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
  XAxis,
  YAxis,
} from 'recharts'
import { formatAmount } from 'utils/formatInfoNumbers'
import { useBurnStats } from 'views/BurnDashboard/hooks/useBurnStats'
import { getBurnInfoPrecision } from 'views/BurnDashboard/utils'
import { StatsCard, StatsCardHeader } from '../StatsCard'
import { TooltipCard } from '../styles'

const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  const { t } = useTranslation()

  if (active && payload && payload.length && !payload[0].payload.isShadowValue) {
    const entry = payload[0].payload
    return (
      <TooltipCard>
        <Text small>
          {new Date(entry.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </Text>

        <FlexGap mt="8px" flexDirection="column" gap="4px">
          <FlexGap justifyContent="space-between" gap="16px">
            <FlexGap alignItems="center" gap="6px">
              <DotIcon color="#7645D9" width="8px" mt="1px" />
              <Text small>{t('Total supply')}</Text>
            </FlexGap>
            <Text small bold>
              {formatAmount(entry.totalSupply, { precision: getBurnInfoPrecision(entry.totalSupply) })}
            </Text>
          </FlexGap>
          <FlexGap justifyContent="space-between" gap="16px">
            <FlexGap alignItems="center" gap="6px">
              <DotIcon color="#02919D" width="8px" mt="1px" />
              <Text small>{t('Net Mint')}</Text>
            </FlexGap>
            <Text small bold>
              {entry.deflation < 0 ? '-' : ''}
              {formatAmount(Math.abs(entry.deflation), { precision: getBurnInfoPrecision(entry.deflation) })}
            </Text>
          </FlexGap>
        </FlexGap>
      </TooltipCard>
    )
  }
  return null
}

export const SupplyDeflationCombinedGraph = (props: CardProps) => {
  const { t } = useTranslation()

  const { isDark } = useTheme()
  const { data: burnStats } = useBurnStats()

  const allChartData = useMemo(() => {
    const keyedDataA = keyBy(burnStats?.totalSupplyTimeSeries, 'timestamp')
    const keyedDataB = keyBy(burnStats?.deflationTimeSeries, 'timestamp')

    const mergedData = merge(keyedDataA, keyedDataB)
    const finalSeriesData = values(mergedData)

    const tempChartData = finalSeriesData.map((item) => ({
      timestamp: item.timestamp,
      timestampFormatted: new Date(item.timestamp).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
      }),
      totalSupply: item.total_supply,
      deflation: item.deflation,
    }))

    const minimumBarValue = Math.min(...tempChartData.map((item) => item.deflation))

    // Add a shadow value to push the graph up and align zero point with bar chart
    if (tempChartData[0]) {
      tempChartData.unshift({
        timestamp: tempChartData[0].timestamp,
        timestampFormatted: tempChartData[0].timestampFormatted,
        totalSupply: minimumBarValue,
        deflation: 0,
        // @ts-ignore
        isShadowValue: true,
      })
    }

    return tempChartData
  }, [burnStats])

  return (
    <StatsCard {...props}>
      <FlexGap mb="24px" justifyContent="space-between" flexWrap="wrap" gap="8px">
        <StatsCardHeader>
          <FlexGap alignItems="center" gap="8px">
            {t('Supply & Net Mint')}
            <QuestionHelperV2
              text={t('Weekly net mint added to CAKE supply and the corresponding CAKE supply')}
              placement="top"
            >
              <InfoIcon color="textSubtle" />
            </QuestionHelperV2>
          </FlexGap>
        </StatsCardHeader>
      </FlexGap>

      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={allChartData}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" stroke={isDark ? '#35363C' : '#F6F4FB'} />
          <Bar dataKey="deflation" fill="#02919D" barSize={4} radius={[4, 4, 4, 4]} yAxisId="right" />
          <Line type="monotone" dataKey="totalSupply" stroke="#7645D9" strokeWidth={2} dot={false} yAxisId="left" />
          <Tooltip wrapperStyle={{ outline: 'none' }} content={<CustomTooltip />} />
          <XAxis
            dataKey="timestampFormatted"
            axisLine={false}
            tickLine={false}
            fontSize={12}
            tick={{ fill: '#9383B4' }}
          />
          <YAxis
            yAxisId="left"
            orientation="left"
            axisLine={false}
            tickLine={false}
            fontSize={12}
            tick={{ fill: '#9383B4' }}
            tickFormatter={(value) =>
              `${value < 0 ? '-' : ''}${formatAmount(Math.abs(value), {
                precision: getBurnInfoPrecision(value),
              })}`
            }
            // padding={{ bottom: 64 }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            axisLine={false}
            tickLine={false}
            fontSize={12}
            tick={{ fill: '#9383B4' }}
            tickFormatter={(value) =>
              `${value < 0 ? '-' : ''}${formatAmount(Math.abs(value), {
                precision: getBurnInfoPrecision(value),
              })}`
            }
          />
        </ComposedChart>
      </ResponsiveContainer>

      <LightGreyCard padding="8px 16px" width="fit-content" mx="auto" mt="4px">
        <FlexGap alignItems="center" gap="16px" flexWrap="wrap">
          <FlexGap alignItems="center" gap="4px">
            <DotIcon color="#7645D9" width="12px" />
            <Text color="textSubtle" small>
              {t('Total supply')}
            </Text>
          </FlexGap>
          <FlexGap alignItems="center" gap="4px">
            <DotIcon color="#02919D" width="12px" />
            <Text color="textSubtle" small>
              {t('Net Mint')}
            </Text>
          </FlexGap>
        </FlexGap>
      </LightGreyCard>
    </StatsCard>
  )
}
