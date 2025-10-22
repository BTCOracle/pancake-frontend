import { useTranslation } from '@pancakeswap/localization'
import { Box, FlexGap, Link, RewardIcon, Text } from '@pancakeswap/uikit'
import React, { memo } from 'react'
import styled from 'styled-components'
import { RewardProvider } from '../FarmStatusDisplay/types'

const StyledCard = styled.div`
  background: ${({ theme }) => theme.colors.positive10};
  border: 1px solid ${({ theme }) => theme.colors.positive20};
  border-radius: 16px;
  padding: 16px;
  margin-top: 16px;
  margin-bottom: 16px;
`
const IconWrapper = styled(Box)`
  color: ${({ theme }) => theme.colors.success};
`
const StyledRewardIcon = styled(RewardIcon)`
  width: 24px;
  height: 24px;
`

const StyledLink = styled(Link)`
  color: ${({ theme }) => theme.colors.success};
  font-weight: 600;
  display: inline-flex;
  align-items: center;

  &:hover {
    text-decoration: underline;
  }
`

interface RewardInfoCardProps {
  provider?: RewardProvider
  multiplier?: number
}

export const RewardInfoCard: React.FC<RewardInfoCardProps> = memo(({ provider, multiplier = 40 }) => {
  const { t } = useTranslation()

  if (!provider) {
    return null
  }

  const content =
    provider === RewardProvider.Ethena ? (
      <>
        <FlexGap alignItems="center" justifyContent="flex-start" gap="4px">
          <IconWrapper>
            <StyledRewardIcon />
          </IconWrapper>
          <Box>
            <Text bold>{t('Boost Your Yield with Ethena')}</Text>
          </Box>
        </FlexGap>
        <Text mb="8px">
          {t('Add liquidity to these pools (USDe/USDT and sUSDe/USDe) to earn massive rewards - 30x Ethena Points!')}
        </Text>
        <FlexGap
          gap="4px"
          justifyContent="flex-start"
          alignItems="center"
          style={{ whiteSpace: 'nowrap' }}
          flexWrap="wrap"
        >
          <StyledLink external href="https://app.ethena.fi/join">
            {t(`Claim your rewards & learn more`)}
          </StyledLink>
          <Text as="span">{t(`on Ethena's official site.`)}</Text>
        </FlexGap>
      </>
    ) : (
      <>
        <FlexGap alignItems="center" justifyContent="flex-start" gap="4px">
          <IconWrapper>
            <StyledRewardIcon />
          </IconWrapper>
          <Box>
            <Text bold>{t('Earn Falcon Miles!')}</Text>
          </Box>
        </FlexGap>
        <Text mb="8px">
          {t(
            "LPs earns %multiplier%x Falcon's Miles based on total TVL contributed to the pool. Miles only accrue to positions within 0.95 to 1.05 range.",
            { multiplier },
          )}
        </Text>
        <StyledLink external href="https://app.falcon.finance/miles">
          {t('Learn more')}
        </StyledLink>
      </>
    )

  return <StyledCard>{content}</StyledCard>
})
