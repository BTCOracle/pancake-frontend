import { useTranslation } from '@pancakeswap/localization'
import { CardProps, Text } from '@pancakeswap/uikit'
import { formatAmount } from 'utils/formatInfoNumbers'
import { useBurnStats } from 'views/BurnDashboard/hooks/useBurnStats'
import { getBurnInfoPrecision } from 'views/BurnDashboard/utils'
import { StatsCard, StatsCardHeader } from '../StatsCard'

export const EmissionsLastSevenDaysCard = (props: CardProps) => {
  const { t } = useTranslation()

  const { data } = useBurnStats()

  const weeklyMint = data?.weekly_mint || 0
  const totalSupply = data?.total_supply || 0

  return (
    <StatsCard {...props}>
      <StatsCardHeader>
        {t('Emissions')}
        &nbsp;
        <span style={{ fontSize: '14px' }}>({t('In last 7d')})</span>
      </StatsCardHeader>

      <Text fontSize="24px" bold>
        {formatAmount(weeklyMint, { precision: getBurnInfoPrecision(weeklyMint) })} CAKE
      </Text>
      <Text fontSize="14px" color="textSubtle">
        {t('%percent%% of total CAKE supply', { percent: ((weeklyMint / totalSupply) * 100).toFixed(2) })}
      </Text>
    </StatsCard>
  )
}
