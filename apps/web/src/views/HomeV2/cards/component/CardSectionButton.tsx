import { ArrowForwardIcon, Button, useMatchBreakpoints } from '@pancakeswap/uikit'
import { useHoverContext } from 'hooks/useHover'
import { useRouter } from 'next/router'
import styled from 'styled-components'

export const CardSectionButton = ({
  link,
  text,
  alwaysShow = false,
}: {
  link: string
  text: string
  alwaysShow?: boolean
}) => {
  const router = useRouter()
  const { isMobile, isTablet } = useMatchBreakpoints()
  const isHover = useHoverContext()

  return (
    <StyledButton
      show={isMobile || isHover || alwaysShow}
      isMobile={isMobile}
      isTablet={isTablet}
      onClick={() => {
        if (link.startsWith('http')) {
          window.open(link, '_blank')
          return
        }
        router.push(link)
      }}
      variant={isMobile ? 'light' : 'primary'}
    >
      {text}
      {!isMobile && <ArrowForwardIcon color="card" ml="8px" />}
    </StyledButton>
  )
}

const StyledButton = styled(Button)<{ isMobile: boolean; isTablet: boolean; show: boolean }>`
  transition: opacity 1s;
  opacity: ${({ show }) => (show ? 1 : 0)};

  height: ${({ isMobile, isTablet }) => {
    if (isMobile) return '40px'
    if (isTablet) return '44px'
    return '48px'
  }};
  padding-right: ${({ isMobile, isTablet }) => {
    if (isMobile) return '16px'
    if (isTablet) return '20px'
    return '24px'
  }};
  padding-left: ${({ isMobile, isTablet }) => {
    if (isMobile) return '16px'
    if (isTablet) return '20px'
    return '24px'
  }};
  border-radius: 999px;
  border-width: 3px;
  margin-right: ${({ isMobile }) => (isMobile ? '0px' : '16px')};

  /* Tablet shares the same color as PC, so we only differentiate mobile vs. not mobile */
  color: ${({ theme, isMobile }) => (isMobile ? theme.colors.textSubtle : theme.colors.card)};
`
