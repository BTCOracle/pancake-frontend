import { Flex, Heading } from '@pancakeswap/uikit'
import styled from 'styled-components'

export const FarmFlexWrapper = styled(Flex)`
  flex-wrap: wrap;
  justify-content: space-between;
  flex-direction: column-reverse;

  ${({ theme }) => theme.mediaQueries.md} {
    flex-wrap: nowrap;
    flex-direction: row;
  }
`
export const FarmH1 = styled(Heading)`
  font-size: 40px;
  margin-bottom: 8px;

  ${({ theme }) => theme.mediaQueries.sm} {
    font-size: 64px;
    margin-bottom: 24px;
  }
`

export const FarmH2 = styled(Heading)`
  font-size: 20px;
  margin-bottom: 8px;
  ${({ theme }) => theme.mediaQueries.sm} {
    font-size: 24px;
    margin-bottom: 18px;
  }
`
