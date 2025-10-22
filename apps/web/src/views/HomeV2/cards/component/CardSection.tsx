import { Box, Card, Flex, Text, useMatchBreakpoints } from '@pancakeswap/uikit'
import { HoverProvider } from 'hooks/useHover'
import { ReactNode } from 'react'
import styled from 'styled-components'
import { CardSectionButton } from './CardSectionButton'

// Helper functions for responsive layout
const getBorderRadius = (isMobile: boolean, isTablet: boolean) => {
  if (isMobile) return '24px'
  if (isTablet) return '36px'
  return '48px'
}

const getMaxWidth = (isMobile: boolean, isTablet: boolean) => {
  if (isMobile) return '100%'
  if (isTablet) return '650px'
  return '588px'
}

const getCardPadding = (isMobile: boolean, isTablet: boolean) => {
  if (isMobile) return '16px'
  if (isTablet) return '8px 0px 20px 0px'
  return '0px 0px 20px 0px'
}

const getFramelessMaxWidth = (isMobile: boolean, isTablet: boolean) => {
  if (isMobile) return '100%'
  if (isTablet) return '650px'
  return '588px'
}

const getTitleFontSize = (isMobile: boolean, isTablet: boolean, isFrameless: boolean) => {
  if (isMobile) {
    return isFrameless ? '16px' : '20px'
  }
  if (isTablet) {
    return isFrameless ? '20px' : '28px'
  }
  return '32px'
}

const getTitleLineHeight = (isMobile: boolean, isTablet: boolean) => {
  if (isMobile) return '30px'
  if (isTablet) return '34px'
  return '38.4px'
}

const getTitlePadding = (isMobile: boolean, isTablet: boolean) => {
  if (isMobile) return '0 0px'
  if (isTablet) return '0 16px'
  return '0 32px'
}

const getFramelessTitleFontSize = (isMobile: boolean, isTablet: boolean) => {
  // Keeping the same for mobile and desktop, but changing slightly for tablet.
  if (isMobile) return '14px'
  if (isTablet) return '16px'
  return '14px'
}

const getFramelessTitleLineHeight = (isMobile: boolean, isTablet: boolean) => {
  if (isMobile) return '24px'
  if (isTablet) return '26px'
  return '24px'
}

const getSubtitleFontSize = (isMobile: boolean, isTablet: boolean) => {
  if (isMobile) return '16px'
  if (isTablet) return '18px'
  return '20px'
}

const getSubtitleLineHeight = (isMobile: boolean, isTablet: boolean) => {
  if (isMobile) return '24px'
  if (isTablet) return '26px'
  return '30px'
}

const getSubtitlePadding = (isMobile: boolean, isTablet: boolean) => {
  if (isMobile) return '0 0px'
  if (isTablet) return '0 16px'
  return '0 32px'
}

const StyledCard = styled(Card)<{ isMobile: boolean; isTablet: boolean }>`
  border-radius: ${({ isMobile, isTablet }) => getBorderRadius(isMobile, isTablet)};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  background: ${({ theme }) => theme.colors.card};
  max-width: ${({ isMobile, isTablet }) => getMaxWidth(isMobile, isTablet)};
  cursor: pointer;
  padding: ${({ isMobile, isTablet }) => getCardPadding(isMobile, isTablet)};
  transition: transform 0.5s ease, box-shadow 0.5s ease;

  ${({ isMobile }) =>
    !isMobile &&
    `
    &:hover {
      transform: translateY(-6px);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
    }
  `}
`

const FramelessCard = styled(Box)<{ isMobile: boolean; isTablet: boolean }>`
  background: ${({ theme }) => theme.colors.card};
  max-width: ${({ isMobile, isTablet }) => getFramelessMaxWidth(isMobile, isTablet)};
  transition: transform 0.2s ease, box-shadow 0.2s ease;
`

interface CardSectionProps {
  title?: string
  subtitle?: string
  children: ReactNode
  button?: {
    link: string
    text: string
  }
  isFrameLess?: boolean
}

const Title = styled(Text)<{ isMobile: boolean; isTablet: boolean; isFrameless: boolean }>`
  font-family: Kanit;
  font-weight: 600;
  font-size: ${({ isMobile, isTablet, isFrameless }) => getTitleFontSize(isMobile, isTablet, isFrameless)};
  line-height: ${({ isMobile, isTablet }) => getTitleLineHeight(isMobile, isTablet)};
  letter-spacing: -0.16px;
  padding: ${({ isMobile, isTablet }) => getTitlePadding(isMobile, isTablet)};
  color: ${({ theme }) => theme.colors.text};
`

const FramelessTitle = styled(Text)<{ isMobile: boolean; isTablet: boolean; isFrameless: boolean }>`
  font-family: Kanit;
  font-weight: 600;
  font-size: ${({ isMobile, isTablet }) => getFramelessTitleFontSize(isMobile, isTablet)};
  line-height: ${({ isMobile, isTablet }) => getFramelessTitleLineHeight(isMobile, isTablet)};
  letter-spacing: 0%;
  color: ${({ theme }) => theme.colors.textSubtle};
`

const Subtitle = styled(Text)<{ isMobile: boolean; isTablet: boolean }>`
  font-family: Kanit;
  font-weight: 600;
  font-size: ${({ isMobile, isTablet }) => getSubtitleFontSize(isMobile, isTablet)};
  line-height: ${({ isMobile, isTablet }) => getSubtitleLineHeight(isMobile, isTablet)};
  padding: ${({ isMobile, isTablet }) => getSubtitlePadding(isMobile, isTablet)};
  letter-spacing: -1%;
  color: ${({ theme }) => theme.colors.textSubtle};
`

export const CardSection: React.FC<CardSectionProps> = ({ title, subtitle, children, button, isFrameLess }) => {
  const { isMobile, isTablet } = useMatchBreakpoints()

  if (isFrameLess) {
    return (
      <FramelessCard isMobile={isMobile} isTablet={isTablet}>
        <Box style={{ padding: isMobile ? '0px 0' : '24px 0' }}>
          <Flex justifyContent="space-between" alignItems="center">
            <Box>
              <FramelessTitle isMobile={isMobile} isTablet={isTablet} isFrameless>
                {title}
              </FramelessTitle>
              {subtitle && (
                <Subtitle isMobile={isMobile} isTablet={isTablet}>
                  {subtitle}
                </Subtitle>
              )}
            </Box>
            {button && <CardSectionButton link={button.link} text={button.text} />}
          </Flex>
        </Box>
        {children}
      </FramelessCard>
    )
  }
  return (
    <HoverProvider>
      {(ref) => {
        return (
          <StyledCard isMobile={isMobile} isTablet={isTablet} className={isMobile ? 'homepage-snap' : ''}>
            <Box ref={ref}>
              <Box style={{ padding: isMobile ? '16px 0' : '24px 0' }}>
                <Flex justifyContent="space-between" alignItems="center">
                  <Box>
                    {title && (
                      <Title isFrameless={Boolean(isFrameLess)} isMobile={isMobile} isTablet={isTablet}>
                        {title}
                      </Title>
                    )}
                    {subtitle && (
                      <Subtitle isMobile={isMobile} isTablet={isTablet}>
                        {subtitle}
                      </Subtitle>
                    )}
                  </Box>
                  {button && <CardSectionButton link={button.link} text={button.text} />}
                </Flex>
              </Box>
              {children}
            </Box>
          </StyledCard>
        )
      }}
    </HoverProvider>
  )
}
