import { Box, BoxProps, useMatchBreakpoints } from '@pancakeswap/uikit'
import { useMemo } from 'react'
import styled from 'styled-components'

export const RowLayout = ({
  sidePadding = '24px',
  fullScreen = false,
  ...props
}: BoxProps & { sidePadding?: string; fullScreen?: boolean }) => {
  const { isMobile, isTablet } = useMatchBreakpoints()

  const flexDirection = useMemo(() => (isTablet || isMobile ? 'column' : 'row'), [isMobile, isTablet])

  return (
    <StyledRowLayout
      {...props}
      fullScreen={fullScreen}
      flexDirection={flexDirection}
      isMobile={isMobile}
      isTablet={isTablet}
      sidePadding={sidePadding}
    />
  )
}

const StyledRowLayout = styled(Box)<{
  flexDirection: 'row' | 'column'
  isMobile: boolean
  isTablet: boolean
  sidePadding: string
  fullScreen?: boolean
}>`
  display: flex;
  flex-direction: ${({ flexDirection }) => flexDirection};
  justify-content: center;
  align-items: center;
  gap: 16px;
  width: 100%;
  max-width: ${({ fullScreen }) => (fullScreen ? 'none' : '1200px')};
  margin: 0 auto;

  ${({ sidePadding }) => `
    padding-left: ${sidePadding};
    padding-right: ${sidePadding};
  `}

  & > div {
    flex: 1;
    /* For mobile view: ensure card width is 100% */
    ${({ isTablet, isMobile }) => (isMobile || isTablet) && 'width: 100%;'}
  }
`
