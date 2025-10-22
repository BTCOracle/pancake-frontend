import { Box, Flex, Text, useMatchBreakpoints } from '@pancakeswap/uikit'
import { useRouter } from 'next/router'
import { useCallback, useMemo } from 'react'
import { styled } from 'styled-components'
import { Price } from 'views/Predictions/components/TokenSelectorV2/Price'
import { useConfig } from 'views/Predictions/context/ConfigProvider'
import { usePredictionConfigs } from 'views/Predictions/hooks/usePredictionConfigs'
import { CurrencyLogo } from '@pancakeswap/widgets-internal'
import { useTranslation } from '@pancakeswap/localization'
import { MobilePredictionTokenSelector } from './Mobile'
import { PausedText } from './styles'

const TabContainer = styled(Flex)`
  display: flex;
  align-items: center;
  gap: 4px;

  background: ${({ theme }) => theme.colors.input};
  border: 1px solid ${({ theme }) => theme.colors.inputSecondary};
  border-radius: 1.5rem;
  width: fit-content;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }

  ${({ theme }) => theme.mediaQueries.md} {
    overflow-x: visible;
  }
`

const TabItem = styled(Flex)<{ isActive: boolean }>`
  gap: 4px;
  position: relative;
  background: ${({ theme, isActive }) => (isActive ? theme.colors.background : 'transparent')};
  border-radius: 24px;
  padding: 8px 16px;
  cursor: pointer;
  align-items: center;
  min-width: fit-content;

  flex-shrink: 0;
  transition: all 0.15s ease;
  z-index: 3;

  ${({ theme, isActive }) =>
    isActive &&
    `
    &::before {
      content: '';
      position: absolute;
      width: 103%;
      height: 105%;
      top: -1.5%;
      left: -2%;
      right: 0;
      bottom: 0;
      border-radius: 24px;
      pointer-events: none;
      background: ${theme.colors.gradientBold};
      z-index: 1;
    }
    
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: ${theme.colors.background};
      border-radius: 24px;
      z-index: 2;
    }
  `}

  &:hover {
    background: ${({ theme, isActive }) => (isActive ? theme.colors.background : theme.colors.backgroundAlt)};
  }

  ${({ theme }) => theme.mediaQueries.md} {
    gap: 8px;
  }
`

const TokenIcon = styled(Box)<{ isActive: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  overflow: visible;
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  position: relative;
  z-index: 3;

  ${({ theme }) => theme.mediaQueries.md} {
    width: 32px;
    height: 32px;
  }

  ${({ isActive }) =>
    isActive &&
    `
    transform: scale(1.9) translateX(-8px) translateY(1px);
  `}
`

const TokenInfo = styled(Flex)`
  flex-direction: column;
  justify-content: center;
  min-width: 0;
  flex: 1;
  position: relative;
  z-index: 3;
`

const TokenName = styled(Text).attrs({ bold: true })<{ isActive: boolean }>`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSubtle};
  text-transform: uppercase;
  white-space: nowrap;
  line-height: 1;
`

const TokenPrice = styled(Box)<{ isActive: boolean }>`
  color: ${({ theme, isActive }) => (isActive ? theme.colors.secondary : theme.colors.textSubtle)};
  font-size: ${({ isActive }) => (isActive ? '20px !important' : '16px !important')};
  white-space: nowrap;
`

interface TokenSelectorV2Props {
  menuWidth?: number
}

export const TokenSelectorV2 = ({ menuWidth }: TokenSelectorV2Props) => {
  const { t } = useTranslation()
  const router = useRouter()
  const { isMobile } = useMatchBreakpoints()
  const config = useConfig()
  const predictionConfigs = usePredictionConfigs()

  const isSmallScreen = isMobile || (menuWidth ? menuWidth < 1310 : false)

  const allTokens = useMemo(() => {
    if (!predictionConfigs || !config) return []

    // Include current token and all other available tokens
    const otherTokens = Object.values(predictionConfigs).filter(
      (i) => i.predictionCurrency.symbol !== config.predictionCurrency.symbol && !i.paused,
    )

    return [config, ...otherTokens]
  }, [config, predictionConfigs])

  const onClickSwitchToken = useCallback(
    (tokenSymbol: string) => {
      if (tokenSymbol && tokenSymbol !== config?.predictionCurrency.symbol) {
        router.query.token = tokenSymbol
        router.replace(router, undefined, { scroll: false })
      }
    },
    [router, config],
  )

  // For mobile, show the mobile component
  if (isSmallScreen) {
    return <MobilePredictionTokenSelector tokens={allTokens} onClickSwitchToken={onClickSwitchToken} />
  }

  return (
    <TabContainer>
      {allTokens.map((token) => {
        const isActive = token.predictionCurrency.symbol === config?.predictionCurrency.symbol

        return (
          <TabItem
            key={token.predictionCurrency.symbol}
            isActive={isActive}
            onClick={() => onClickSwitchToken(token.predictionCurrency.symbol)}
          >
            <TokenIcon isActive={isActive}>
              <CurrencyLogo
                size="32px"
                currency={token.predictionCurrency}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                showChainLogo
              />
            </TokenIcon>
            <TokenInfo>
              {!token.paused && (
                <TokenPrice isActive={isActive}>
                  <Price
                    fontSize="inherit"
                    color="inherit"
                    displayedDecimals={token.displayedDecimals}
                    chainlinkOracleAddress={token.chainlinkOracleAddress}
                    galetoOracleAddress={token.galetoOracleAddress}
                  />
                </TokenPrice>
              )}
              <Box>
                <TokenName isActive={isActive}>{`${token.predictionCurrency.symbol}USD`}</TokenName>
                {token.paused && <PausedText mb="-4px">({t('Paused')})</PausedText>}
              </Box>
            </TokenInfo>
          </TabItem>
        )
      })}
    </TabContainer>
  )
}
