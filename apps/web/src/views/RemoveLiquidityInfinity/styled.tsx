import { Card } from '@pancakeswap/uikit'
import DefaultCard from 'components/Card'
import styled from 'styled-components'

export const StyledCard = styled(Card)`
  width: 100%;
  max-width: 440px;
`

export const StyledBinCard = styled(Card)`
  width: 100%;
  max-width: 580px;
`

export const StyledInfoCard = styled(DefaultCard)`
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  background: ${({ theme }) => theme.colors.background};
  padding: 12px 18px;
`
