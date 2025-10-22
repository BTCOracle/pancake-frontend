import { useTranslation } from '@pancakeswap/localization'
import { CardProps, FlexGap, InfoIcon, QuestionHelperV2, Text } from '@pancakeswap/uikit'
import { useCakePrice } from 'hooks/useCakePrice'
import { useMemo } from 'react'
import { formatAmount } from 'utils/formatInfoNumbers'
import { useBurnStats } from 'views/BurnDashboard/hooks/useBurnStats'
import { getBurnInfoPrecision } from 'views/BurnDashboard/utils'
import { StatsCard, StatsCardHeader } from '../StatsCard'

export const YTDBurnCard = (props: CardProps) => {
  const { t } = useTranslation()
  const { data } = useBurnStats()
  const cakePrice = useCakePrice()

  const weeklyBurnSeries = data?.deflationTimeSeries

  // Calculate YTD burn by summing weekly burn series from start of year to today
  const ytdBurn = useMemo(() => {
    if (!weeklyBurnSeries || weeklyBurnSeries.length === 0) return 0

    // Get the start of the current year (January 1st)
    const currentYear = new Date().getFullYear()
    const startOfYear = new Date(currentYear, 0, 1).getTime()

    // Filter burn series to only include entries from the start of the year
    const ytdBurnSeries = weeklyBurnSeries.filter((entry) => entry.timestamp >= startOfYear)

    return ytdBurnSeries.reduce((total, entry) => total + entry.burn, 0)
  }, [weeklyBurnSeries])

  const ytdBurnUSD = ytdBurn * (Number(cakePrice) || 0)

  return (
    <StatsCard {...props}>
      <FlexGap alignItems="center" gap="4px">
        <StatsCardHeader>{t('YTD Burn')}</StatsCardHeader>
        <QuestionHelperV2
          text={t('Year-to-date (YTD) Burn: Absolute total (not the net amount) of CAKE burn since start of the year')}
          placement="top"
        >
          <InfoIcon color="textSubtle" />
        </QuestionHelperV2>
      </FlexGap>
      <Text fontSize="24px" bold>
        {formatAmount(ytdBurn, { precision: getBurnInfoPrecision(ytdBurn) })} CAKE
      </Text>
      <Text fontSize="14px" color="textSubtle">
        ~${formatAmount(ytdBurnUSD, { precision: 2 })}
      </Text>
    </StatsCard>
  )
}
