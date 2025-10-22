import { useTranslation } from '@pancakeswap/localization'
import { CardProps, FlexGap, InfoIcon, QuestionHelperV2, Text } from '@pancakeswap/uikit'
import { useMemo } from 'react'
import { formatAmount } from 'utils/formatInfoNumbers'
import { useBurnStats } from 'views/BurnDashboard/hooks/useBurnStats'
import { getBurnInfoPrecision } from 'views/BurnDashboard/utils'
import { StatsCard, StatsCardHeader } from '../StatsCard'

export const YTDDeflationCard = (props: CardProps) => {
  const { t } = useTranslation()

  const { data } = useBurnStats()
  const totalSupply = data?.total_supply || 0

  const totalSupplyYTD = useMemo(() => {
    const totalSupplySeries = data?.totalSupplyTimeSeries || []

    if (!totalSupplySeries || totalSupplySeries.length === 0) return 0

    // Get the start of the current year (January 1st)
    const currentYear = new Date().getFullYear()
    const startOfYear = new Date(currentYear, 0, 1).getTime()

    // Find entries from the last week of December of the previous year
    const lastWeekOfPrevYear = new Date(currentYear - 1, 11, 24).getTime() // December 24th

    // First try to find entries from the last week of December
    const decemberEntries = totalSupplySeries.filter(
      (entry) => entry.timestamp >= lastWeekOfPrevYear && entry.timestamp < startOfYear,
    )

    if (decemberEntries.length > 0) {
      // Sort by timestamp in descending order and take the most recent one
      return decemberEntries.sort((a, b) => b.timestamp - a.timestamp)[0].total_supply
    }

    // If no December entries, try to find entries from the first week of January
    const firstWeekOfYear = new Date(currentYear, 0, 7).getTime() // January 7th
    const januaryEntries = totalSupplySeries.filter(
      (entry) => entry.timestamp >= startOfYear && entry.timestamp <= firstWeekOfYear,
    )

    if (januaryEntries.length > 0) {
      // Sort by timestamp in ascending order and take the earliest one
      return januaryEntries.sort((a, b) => a.timestamp - b.timestamp)[0].total_supply
    }

    // If no entries found, return the first available entry
    return totalSupplySeries[0]?.total_supply || 0
  }, [data])

  const ytdDeflation = totalSupplyYTD - totalSupply
  const ytdDeflationOfTotalSupplyPercentage = (ytdDeflation / totalSupplyYTD) * 100

  return (
    <StatsCard {...props}>
      <StatsCardHeader>
        <FlexGap alignItems="center" gap="4px">
          {t('YTD Deflation')}
          <QuestionHelperV2
            text={t('Year-to-date (YTD) deflation: % decrease in CAKE supply since start of the year')}
            placement="top"
          >
            <InfoIcon color="textSubtle" />
          </QuestionHelperV2>
        </FlexGap>
      </StatsCardHeader>

      <Text fontSize="24px" bold>
        {ytdDeflationOfTotalSupplyPercentage.toFixed(2)}%
      </Text>
      <Text fontSize="14px" color="textSubtle">
        {t('of %amount% CAKE supply', {
          amount: formatAmount(totalSupplyYTD, { precision: getBurnInfoPrecision(totalSupplyYTD) }),
        })}
      </Text>
    </StatsCard>
  )
}
