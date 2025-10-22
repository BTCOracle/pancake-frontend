import { Button } from '@pancakeswap/uikit'
import styled from 'styled-components'

export const ActionButton = styled(Button).attrs({
  scale: 'sm',
  variant: 'tertiary',
})<{ isIcon?: boolean; disabled?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 48px;
  width: ${({ isIcon }) => (isIcon ? '48px' : '')};
  background-color: transparent;
  color: ${({ theme }) => theme.colors.primary60};
  border: 2px solid ${({ theme, disabled }) => (disabled ? theme.colors.textDisabled : theme.colors.primary)};
  border-radius: ${({ theme }) => theme.radii.default};
  padding: 16px;
  transition: opacity 0.2s ease;
  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  &:hover:not(:disabled) {
    opacity: 0.6;
  }

  & > svg {
    fill: ${({ theme, disabled }) => (disabled ? theme.colors.textDisabled : theme.colors.primary60)};
  }
`

export const PrimaryOutlineButton = styled(Button)`
  border: 2px solid ${({ theme }) => theme.colors.primary};
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.primary60};
  font-weight: 600;
  font-size: 16px;
  padding: 8px 16px;
  border-radius: 16px;
  &:hover {
    opacity: 0.8;
  }
`
