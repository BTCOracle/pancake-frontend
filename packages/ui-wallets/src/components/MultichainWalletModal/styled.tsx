import { AtomBox } from '@pancakeswap/uikit'
import styled from 'styled-components'

export const StyledMobileContainer = styled(AtomBox)<{ $fullHeight?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 16px;
  justify-content: space-between;
  width: 100%;

  height: ${({ $fullHeight }) => ($fullHeight ? '100%' : 'auto')};
`
