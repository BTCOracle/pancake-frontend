import { Box } from '@pancakeswap/uikit'
import styled from 'styled-components'

export const ResponsiveTwoColumns = styled(Box)`
  display: grid;
  grid-column-gap: 32px;
  grid-row-gap: 16px;
  grid-template-columns: 1fr;

  grid-template-rows: max-content;
  grid-auto-flow: row;

  ${({ theme }) => theme.mediaQueries.xl} {
    grid-template-columns: 1fr 1fr;
  }
`

export const ResponsiveTwoThirdColumns = styled(Box)`
  ${({ theme }) => theme.mediaQueries.xl} {
    display: grid;
    grid-template-columns: 1fr 2fr;

    grid-column-gap: 32px;
    grid-row-gap: 16px;

    grid-template-rows: max-content;
    grid-auto-flow: row;
  }
`
