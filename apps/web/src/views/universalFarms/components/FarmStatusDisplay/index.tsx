import { useTranslation } from '@pancakeswap/localization'
import { Box, Flex, FlexGap, Link, RewardIcon, Text, useMatchBreakpoints, useTooltip } from '@pancakeswap/uikit'

import React from 'react'
import styled from 'styled-components'

import { RewardProvider } from './types'

const IconWrapper = styled(Box)`
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 4px;
  width: 33px;
  height: 33px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.positive10};
  color: ${({ theme }) => theme.colors.positive60};
`

const StyledRewardIcon = styled(RewardIcon)`
  width: 18px;
  height: 18px;
`

interface RewardStatusDisplayProps {
  provider?: RewardProvider
  multiplier?: number
}

export const RewardStatusDisplay: React.FC<RewardStatusDisplayProps> = ({ provider, multiplier = 40 }) => {
  const { t } = useTranslation()
  const { isMobile } = useMatchBreakpoints()

  const content =
    provider === RewardProvider.Ethena ? (
      <Box>
        <Box>
          <Text bold as="span">
            {t('Earn 30x Ethena Points!')}
          </Text>
        </Box>
        <Text as="span">{t('Add liquidity to this pool and earn 30x Ethena points!')}</Text>
        <FlexGap gap="4px" justifyContent="flex-start" display="inline-flex" alignItems="center" flexWrap="wrap">
          <Link mt="8px" external href="https://app.ethena.fi/join">
            {t('Claim your rewards & learn more')}
          </Link>
          <Text as="span">{t(`on Ethena's official site.`)}</Text>
        </FlexGap>
      </Box>
    ) : (
      <Box>
        <Box>
          <Text bold as="span">
            {t('Earn Falcon Miles!')}
          </Text>
        </Box>
        <Text as="span">
          {t(
            "LPs earns %multiplier%x Falcon's Miles based on total TVL contributed to the pool. Miles only accrue to positions within 0.95 to 1.05 range.",
            { multiplier },
          )}
        </Text>
        <FlexGap gap="4px" justifyContent="flex-start" display="inline-flex" alignItems="center" flexWrap="wrap">
          <Link mt="8px" external href="https://app.falcon.finance/miles">
            {t('Learn more')}
          </Link>
        </FlexGap>
      </Box>
    )
  const { targetRef, tooltip, tooltipVisible } = useTooltip(content, { placement: isMobile ? 'auto' : 'right' })
  if (!provider) {
    return null
  }

  return (
    <Flex alignItems="center">
      <IconWrapper ref={targetRef}>
        <StyledRewardIcon />
      </IconWrapper>
      {tooltipVisible && tooltip}
    </Flex>
  )
}
