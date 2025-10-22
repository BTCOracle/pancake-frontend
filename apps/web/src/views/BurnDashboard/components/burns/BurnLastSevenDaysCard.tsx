import { useTranslation } from '@pancakeswap/localization'
import { Box, CardProps, Flex, Text } from '@pancakeswap/uikit'
import { LightGreyCard } from 'components/Card'
import { ProgressBar } from 'components/Progress/ProgressBar'
import { formatAmount } from 'utils/formatInfoNumbers'
import { useBurnStats } from 'views/BurnDashboard/hooks/useBurnStats'
import { getBurnInfoPrecision } from 'views/BurnDashboard/utils'
import { StatsCard, StatsCardHeader } from '../StatsCard'

export const BurnLastSevenDaysCard = (props: CardProps) => {
  const { t } = useTranslation()

  const { data } = useBurnStats()

  const totalSupply = data?.total_supply || 0

  const weeklyBurn = data?.weekly_burn || 0

  const weeklyBurnPercentage = (weeklyBurn / totalSupply) * 100

  return (
    <StatsCard {...props}>
      <StatsCardHeader>{t('Burn (In last 7d)')}</StatsCardHeader>
      <LightGreyCard mt="8px" padding="16px">
        <Text fontSize="18px" bold>
          {formatAmount(weeklyBurn, { precision: getBurnInfoPrecision(weeklyBurn) })} CAKE
        </Text>

        <Text mt="16px" color="textSubtle" small>
          <Box as="span" color="text" style={{ fontWeight: 600 }}>
            {weeklyBurnPercentage.toFixed(2)}%
          </Box>{' '}
          {t('of total CAKE supply')}
        </Text>
        <ProgressBar
          mt="8px"
          min={0}
          max={100}
          progress={weeklyBurnPercentage}
          backgroundColor="secondary20"
          fillColor="success"
          height="8px"
        />
        <Flex mt="8px" justifyContent="space-between">
          <Text color="textSubtle" fontSize="12px">
            0%
          </Text>
          <Text color="textSubtle" fontSize="12px">
            100%
          </Text>
        </Flex>
      </LightGreyCard>
    </StatsCard>
  )
}
