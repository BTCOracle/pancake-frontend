import { Text } from '@pancakeswap/uikit'
import styled from 'styled-components'

export const PausedText = styled(Text).attrs({ bold: true, small: true })`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSubtle};
`
