import { Box } from '@pancakeswap/uikit'
import { styled } from 'styled-components'

const IdoLayout = styled(Box)`
  background-color: ${({ theme }) => theme.colors.gradientBubblegum};
`
export const IdoLayoutWrapper = styled(IdoLayout)`
  column-gap: 32px;
  display: grid;
  grid-template-columns: 1fr;
  align-items: flex-start;
  > div {
    margin: 0 auto;
  }
`

export default IdoLayout
