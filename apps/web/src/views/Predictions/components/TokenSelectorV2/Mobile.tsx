import { PredictionConfig } from '@pancakeswap/prediction'
import { Box, Flex, Text } from '@pancakeswap/uikit'
import { styled } from 'styled-components'
import { Price } from 'views/Predictions/components/TokenSelectorV2/Price'
import { useConfig } from 'views/Predictions/context/ConfigProvider'
import { CurrencyLogo } from '@pancakeswap/widgets-internal'
import { useTranslation } from '@pancakeswap/localization'
import { PausedText } from './styles'

interface MobilePredictionTokenSelectorProps {
  tokens: PredictionConfig[]
  onClickSwitchToken: (tokenSymbol: string) => void
}

const MobileTabContainer = styled(Flex)`
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

const MobileTabItem = styled(Flex)<{ isActive: boolean }>`
  gap: 12px;
  position: relative;
  background: ${({ theme, isActive }) => (isActive ? theme.colors.background : 'transparent')};
  border-radius: 24px;
  padding: ${({ isActive }) => (isActive ? '8px 6px 8px 2px' : '16px')};
  cursor: pointer;
  align-items: center;
  min-width: max-content;

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
`

const MobileTokenIcon = styled(Box)<{ isActive: boolean }>`
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
    transform: scale(1.9) translateX(-6px) translateY(1px);
  `}
`

const MobileTokenInfo = styled(Flex)`
  flex-direction: column;
  justify-content: center;
  min-width: 0;
  flex: 1;
  position: relative;
  z-index: 3;
`

const MobileTokenName = styled(Text).attrs({ bold: true })<{ isActive: boolean }>`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSubtle};
  text-transform: uppercase;
  white-space: nowrap;
  line-height: 1;
`

const MobileTokenPrice = styled(Box)<{ isActive: boolean }>`
  color: ${({ theme, isActive }) => (isActive ? theme.colors.secondary : theme.colors.textSubtle)};
  font-size: ${({ isActive }) => (isActive ? '20px !important' : '16px !important')};
  white-space: nowrap;
`

export const MobilePredictionTokenSelector: React.FC<MobilePredictionTokenSelectorProps> = ({
  tokens,
  onClickSwitchToken,
}) => {
  const config = useConfig()
  const { t } = useTranslation()

  return (
    <MobileTabContainer>
      {tokens.map((token) => {
        const isActive = token.predictionCurrency.symbol === config?.predictionCurrency.symbol

        return (
          <MobileTabItem
            key={token.predictionCurrency.symbol}
            isActive={isActive}
            onClick={() => onClickSwitchToken(token.predictionCurrency.symbol)}
          >
            <MobileTokenIcon isActive={isActive}>
              <CurrencyLogo
                size="32px"
                currency={token.predictionCurrency}
                style={{
                  opacity: token.paused && !isActive ? 0.5 : 1,
                }}
                showChainLogo
              />
            </MobileTokenIcon>
            {isActive && (
              <MobileTokenInfo>
                {!token.paused && (
                  <MobileTokenPrice isActive={isActive}>
                    <Price
                      fontSize="inherit"
                      color="inherit"
                      displayedDecimals={token.displayedDecimals}
                      chainlinkOracleAddress={token.chainlinkOracleAddress}
                      galetoOracleAddress={token.galetoOracleAddress}
                    />
                  </MobileTokenPrice>
                )}
                <Box>
                  <MobileTokenName isActive={isActive}>{`${token.predictionCurrency.symbol}USD`}</MobileTokenName>
                  {token.paused && <PausedText mb="-4px">({t('Paused')})</PausedText>}
                </Box>
              </MobileTokenInfo>
            )}
          </MobileTabItem>
        )
      })}
    </MobileTabContainer>
  )
}
