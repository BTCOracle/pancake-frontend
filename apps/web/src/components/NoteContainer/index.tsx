import { Box } from '@pancakeswap/uikit'
import styled from 'styled-components'

export const NoteContainer = styled(Box)`
  padding: 16px;
  border: 2px solid ${({ theme }) => theme.colors.input};
  border-radius: 16px;
  flex-grow: 1;
  flex-basis: 0;
  word-wrap: break-word;
`
