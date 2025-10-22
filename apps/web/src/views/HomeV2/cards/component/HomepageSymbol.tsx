import { Text } from '@pancakeswap/uikit'
import styled from 'styled-components'

// We add a small helper function to handle the font size based on isMobile and isTablet
const getFontSize = (isMobile?: boolean, isTablet?: boolean) => {
  if (isMobile) return '16px'
  if (isTablet) return '20px'
  return '24px'
}

export const HomepageSymbol = styled(Text)<{
  isCTA?: boolean
  isMobile?: boolean
  isTablet?: boolean
}>`
  font-family: Kanit;
  font-weight: 600;
  letter-spacing: -1%;
  cursor: pointer;
  transition: color 0.2s ease-in-out, transform 0.2s ease-in-out;
  font-size: ${({ isMobile, isTablet }) => getFontSize(isMobile, isTablet)};

  &:hover {
    transform: ${({ isCTA }) => (isCTA ? 'scale(1.05)' : 'none')};
  }
`
