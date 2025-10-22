import { Card, CardHeader } from '@pancakeswap/uikit'
import styled from 'styled-components'

export const BodyWrapper = styled(Card)`
  border-radius: 24px;
  max-width: 858px;
  width: 100%;
  z-index: 1;
`

export const StyledCardHeader = styled(CardHeader)`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-bottom: 1px solid ${({ theme }) => theme.colors.cardBorder};

  ${({ theme }) => theme.mediaQueries.sm} {
    flex-direction: row;
  }
`
