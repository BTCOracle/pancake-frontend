import styled from 'styled-components'
import {
  Card as RawCard,
  CardBody as RawCardBody,
  CardFooter as RawCardFooter,
  CardHeader as RawCardHeader,
} from '@pancakeswap/uikit'

export const Card = styled(RawCard)`
  overflow: initial;
  min-height: 600px;
  display: flex;
  flex-direction: column;
`

export const CardHeader = styled(RawCardHeader)`
  padding: 16px;
  background: ${({ theme }) => theme.card.background};

  ${({ theme }) => theme.mediaQueries.sm} {
    padding: 24px;
  }
`

export const CardBody = styled(RawCardBody)`
  padding: 0;
`

export const CardFooter = styled(RawCardFooter)`
  position: sticky;
  bottom: 50px;
  z-index: 50;
  border-bottom-right-radius: ${({ theme }) => theme.radii.card};
  border-bottom-left-radius: ${({ theme }) => theme.radii.card};
  background: ${({ theme }) => theme.card.background};
  text-align: center;
  font-size: 12px;
  font-weight: 400;
  color: ${({ theme }) => theme.colors.textSubtle};
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
  line-height: 18px;
  padding: 12px 16px;

  ${({ theme }) => theme.mediaQueries.lg} {
    bottom: 0;
  }
`
