import { Flex } from '@pancakeswap/uikit'
import styled from 'styled-components'

export const Container = styled(Flex)<{ $withLink?: boolean }>`
  padding: 12px;

  ${({ theme }) => theme.mediaQueries.sm} {
    padding: 16px;
  }

  align-items: flex-start;
  position: relative;
  gap: 12px;
  border-radius: 20px;
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-bottom-width: 2px;
  background: ${({ theme }) => theme.card.background};
  margin: 8px 0;
  cursor: pointer;

  ${({ theme, $withLink }) =>
    $withLink &&
    `
    &:hover {
      background: ${theme.colors.backgroundHover};
    }
    &:active {
      background: ${theme.colors.backgroundTapped};
    }
  `}

  &:first-of-type {
    margin-top: 0;
  }
`
