import { useTranslation } from '@pancakeswap/localization'
import { CardProps, FlexGap, InfoIcon, QuestionHelperV2, Text } from '@pancakeswap/uikit'
import { useCakePrice } from 'hooks/useCakePrice'
import { useMemo } from 'react'
import { formatAmount } from 'utils/formatInfoNumbers'
import { useBurnStats } from 'views/BurnDashboard/hooks/useBurnStats'
import { getBurnInfoPrecision } from 'views/BurnDashboard/utils'
import { StatsCard, StatsCardHeader } from '../StatsCard'

export const YTDEmissionsCard = (props: CardProps) => {
  const { t } = useTranslation()
  const cakePrice = useCakePrice()

  const { data } = useBurnStats()

  const deflationSeries = data?.deflationTimeSeries

  const ytdActualMint = useMemo(() => {
    if (!deflationSeries || deflationSeries.length === 0) return 0

    // Get the start of the current year (January 1st)
    const currentYear = new Date().getFullYear()
    const startOfYear = new Date(currentYear, 0, 1).getTime()

    // Filter deflation series to only include entries from the start of the year
    const ytdEmissionsSeries = deflationSeries.filter((entry) => entry.timestamp >= startOfYear)

    return ytdEmissionsSeries.reduce((total, entry) => total + entry.actualMint, 0)
  }, [deflationSeries])

  const ytdEmissionsUSD = ytdActualMint * (Number(cakePrice) || 0)

  return (
    <StatsCard {...props}>
      <FlexGap alignItems="center" gap="4px">
        <StatsCardHeader>{t('YTD Emissions')}</StatsCardHeader>
        <QuestionHelperV2
          text={t(
            'Year-to-date (YTD) Emissions: Absolute total (not the net amount) of CAKE emissions since start of the year',
          )}
          placement="top"
        >
          <InfoIcon color="textSubtle" />
        </QuestionHelperV2>
      </FlexGap>

      <Text fontSize="24px" bold>
        {formatAmount(ytdActualMint, { precision: getBurnInfoPrecision(ytdActualMint) })} CAKE
      </Text>

      <Text fontSize="14px" color="textSubtle">
        ~${formatAmount(ytdEmissionsUSD, { precision: 2 })}
      </Text>
    </StatsCard>
  )
}
