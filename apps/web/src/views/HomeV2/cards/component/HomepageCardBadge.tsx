import { Box, Flex, Text, TriangleDownIcon, TriangleUpIcon, useMatchBreakpoints } from '@pancakeswap/uikit'
import { useHoverContext } from 'hooks/useHover'
import React, { ReactNode } from 'react'
import styled, { useTheme } from 'styled-components'

interface HomepageCardBadgeProps {
  text: string | ReactNode
  priceChange?: number
}

const getPadding = (isMobile: boolean, isTablet: boolean) => {
  if (isMobile) return 8
  if (isTablet) return 12
  return 16
}

const getBorderRadius = (isMobile: boolean, isTablet: boolean) => {
  if (isMobile) return '16px'
  if (isTablet) return '24px'
  return '999px'
}

const Badge = styled(Flex)<{ isMobile: boolean; isTablet: boolean; isHover: boolean; isPositive: boolean }>`
  height: 40px;
  padding: 4px ${({ isMobile, isTablet }) => getPadding(isMobile, isTablet)}px;
  border-radius: ${({ isMobile, isTablet }) => getBorderRadius(isMobile, isTablet)};
  border-color: ${({ theme, isHover, isPositive }) =>
    isHover ? (isPositive ? theme.colors.positive20 : theme.colors.destructive20) : 'transparent'};
  border-width: 2px;
  transition: border-width 0.5s;
  border-style: solid;
  background: ${({ theme, isPositive }) => (isPositive ? theme.colors.positive10 : theme.colors.destructive10)};
  display: flex;
  align-items: center;
  text-align: right;
`

const Percent = styled(Text)`
  font-family: Kanit;
  font-weight: 600;
  font-size: 14px;
  line-height: 21px;
  letter-spacing: 0%;
  color: ${({ theme }) => theme.colors.textSubtle};
  display: flex;
  align-items: center;
  justify-content: center;
  svg {
    width: 11px;
    height: auto; /* recommended */
  }
`

export const HomepageCardBadge: React.FC<HomepageCardBadgeProps> = ({ text, priceChange }) => {
  const theme = useTheme()
  const { isMobile, isTablet } = useMatchBreakpoints()
  const isHover = useHoverContext()
  const isPositive = !priceChange || priceChange >= 0

  return (
    <Badge isMobile={isMobile} isTablet={isTablet} isHover={isHover} isPositive={isPositive}>
      <Box>
        {typeof text !== 'string' ? (
          text
        ) : (
          <Text bold color={isPositive ? theme.colors.positive60 : theme.colors.destructive} mr="4px">
            {text}
          </Text>
        )}
      </Box>
      {priceChange !== undefined && (
        <Percent>
          {priceChange > 0 && <TriangleUpIcon />}
          {priceChange < 0 && <TriangleDownIcon />}
          <Text bold color="textSubtitle" ml="4px">
            {priceChange.toFixed(2)}%
          </Text>
        </Percent>
      )}
    </Badge>
  )
}
