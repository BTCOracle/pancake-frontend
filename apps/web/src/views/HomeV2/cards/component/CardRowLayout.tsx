import { Flex, useMatchBreakpoints } from '@pancakeswap/uikit'
import { HoverProvider } from 'hooks/useHover'
import styled, { css } from 'styled-components'

const getPadding = (isMobile: boolean, isTablet: boolean) => {
  if (isMobile) {
    return '0px 0px'
  }
  if (isTablet) {
    return '16px 24px 0 24px'
  }
  return '20px 32px 0 32px'
}

const getHeight = (isMobile: boolean, isTablet: boolean) => {
  if (isMobile) {
    return '60px'
  }
  if (isTablet) {
    return '72px'
  }
  return '80px'
}

const Layout = styled(Flex)<{ $isLast?: boolean; isMobile: boolean; isTablet: boolean }>`
  ${({ $isLast, theme }) =>
    !$isLast &&
    css`
      border-bottom: 1px solid ${theme.colors.cardBorder};
    `}
  padding: ${({ isMobile, isTablet }) => getPadding(isMobile, isTablet)};
  height: ${({ isMobile, isTablet }) => getHeight(isMobile, isTablet)};
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;

  ${({ isMobile }) =>
    !isMobile &&
    `
  &:hover {
    transform: scale(1.05);
    transition: transform 0.3s ease;
  }
  `}
`

export const CardRowLayout = ({
  left,
  children,
  isLast,
  onClick,
}: {
  left: React.ReactNode
  children: React.ReactNode
  isLast?: boolean
  onClick?: () => void
}) => {
  const { isMobile, isTablet } = useMatchBreakpoints()
  return (
    <HoverProvider>
      <Layout
        isMobile={isMobile}
        isTablet={isTablet}
        onClick={onClick}
        alignItems="center"
        justifyContent="space-between"
        $isLast={isLast}
      >
        <Flex alignItems="center">{left}</Flex>
        <Flex alignItems="center">{children}</Flex>
      </Layout>
    </HoverProvider>
  )
}
