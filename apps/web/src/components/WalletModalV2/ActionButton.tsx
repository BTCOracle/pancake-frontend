import { Button } from '@pancakeswap/uikit'
import { styled } from 'styled-components'

export const ActionButton = styled(Button)`
  width: 100%;
  border-radius: 16px;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textSubtle};
  background-color: ${({ theme }) => theme.colors.input};
  box-shadow: 0px -2px 0px 0px #0000001a inset;
`
