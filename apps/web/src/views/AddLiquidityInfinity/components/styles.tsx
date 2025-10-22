import { Box, Grid } from '@pancakeswap/uikit'
import styled from 'styled-components'

export const ResponsiveColumns = styled(Box)`
  display: grid;
  grid-column-gap: 32px;
  grid-row-gap: 16px;
  grid-template-columns: 1fr;

  grid-template-rows: max-content;
  grid-auto-flow: row;

  ${({ theme }) => theme.mediaQueries.xl} {
    grid-template-columns: 5fr 3fr;
  }
`
export const TokenFilterContainer = styled(Grid)`
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 5px;
`
