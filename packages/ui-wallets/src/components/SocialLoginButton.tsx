import { useTranslation } from '@pancakeswap/localization'
import { ArrowDropDownIcon, AutoRow, Button, Flex, FlexGap, Text } from '@pancakeswap/uikit'
import React from 'react'
import { styled } from 'styled-components'

const SocialLoginIconBox = styled.div<{ $bg: string }>`
  position: relative;
  width: 24px;
  height: 24px;
  border-radius: 8px;
  &:not(:first-child) {
    margin-left: -10px;
  }
  background-image: ${({ $bg }) => `url(${$bg})`};
  background-size: cover;
  background-position: center center;
  background-color: white;
  padding: 4px;
  overflow: hidden;
`

const StyledButton = styled(Button)`
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-bottom: 2px solid ${({ theme }) => theme.colors.cardBorder};
  padding: 12px;
  background-color: ${({ theme }) => theme.colors.backgroundAlt};

  ${({ theme }) => theme.mediaQueries.md} {
    background-color: transparent;
  }
`

interface SocialLoginButtonProps {
  onClick: () => void
  assetCdn: string
  style?: React.CSSProperties
}

const SocialLoginButton: React.FC<SocialLoginButtonProps> = ({ onClick, assetCdn, style }) => {
  const { t } = useTranslation()

  // Fixed 4 social icons
  const socialIcons = ['google-colors.svg', 'x-colors.svg', 'telegram-colors.png', 'discord-colors.svg']

  return (
    <StyledButton variant="text" onClick={onClick} width="100%" style={style} padding="0px">
      <Flex justifyContent="space-between" width="100%" alignItems="center">
        <FlexGap gap="8px" alignItems="center">
          {socialIcons.map((icon, index) => (
            <SocialLoginIconBox key={index} $bg={`${assetCdn}/web/wallets/social-login/${icon}`} />
          ))}
        </FlexGap>
        <AutoRow width="fit-content" gap="8px" alignItems="center">
          <Text fontSize="12px" color="textSubtle">
            {t('Social Login')}
          </Text>
          <ArrowDropDownIcon width="24px" height="24px" color="textSubtle" style={{ rotate: '-90deg' }} />
        </AutoRow>
      </Flex>
    </StyledButton>
  )
}

export default SocialLoginButton
