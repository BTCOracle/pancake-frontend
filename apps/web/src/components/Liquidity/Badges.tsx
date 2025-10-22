import { PoolType } from '@pancakeswap/infinity-sdk'
import { BarChartIcon, Box, BoxProps, CurvedChartIcon, Text } from '@pancakeswap/uikit'
import styled from 'styled-components'
import { space } from 'styled-system'

const Badge = styled(Box)`
  padding: 0 12px;
  width: fit-content;
  border-radius: ${({ theme }) => theme.radii['20px']};

  display: inline-flex;
  align-items: center;

  user-select: none;

  ${space}
`

export const GreyBadge = styled(Badge)<{ $withBorder?: boolean }>`
  background: ${({ theme }) => theme.colors.tertiary};
  ${({ $withBorder, theme }) =>
    $withBorder &&
    `
    border: 2px solid ${theme.colors.tertiary20};
    `}
`

interface PoolTypeBadgeProps extends BoxProps {
  poolType: PoolType
  withBorder?: boolean
}
export const PoolTypeBadge = ({ poolType, withBorder, ...props }: PoolTypeBadgeProps) => {
  return (
    <GreyBadge $withBorder={withBorder} {...props}>
      {poolType === 'CL' ? <CurvedChartIcon color="textSubtle" /> : <BarChartIcon color="textSubtle" />}
      <Text color="textSubtle" small>
        {poolType === 'CL' ? 'CLAMM' : 'LBAMM'}
      </Text>
    </GreyBadge>
  )
}

// Might get these Tags/Badges added by universal farm page feature when its pushed
type TagVariant = 'default' | 'success' | 'warning' | 'danger' | 'info'
const StyledTag = styled(Badge)<{ $variant: TagVariant }>`
  padding: 4px 8px;
  font-size: 12px;

  ${({ $variant, theme }) => {
    if ($variant === 'warning') {
      return `
        background: ${theme.colors.v2Warning10};
        color: ${theme.colors.v2Warning60};
        border: 2px solid ${theme.colors.v2Warning20};
      `
    }
    if ($variant === 'danger') {
      return `
        background: ${theme.colors.v2Destructive10};
        color: ${theme.colors.v2Destructive60};
        border: 2px solid ${theme.colors.v2Destructive20};
      `
    }
    if ($variant === 'success') {
      return `
        background: ${theme.colors.v2Positive10};
        color: ${theme.colors.v2Positive60};
        border: 2px solid ${theme.colors.v2Positive20};
      `
    }

    if ($variant === 'info') {
      return `
        background: ${theme.colors.v2Secondary10};
        color: ${theme.colors.secondary};
        border: 2px solid ${theme.colors.v2Secondary20};
      `
    }

    return `
      background: ${theme.colors.v2Tertiary10};
      color: ${theme.colors.v2Tertiary70};
      border: 2px solid ${theme.colors.v2Tertiary20};
      `
  }}
`
interface TagV2Props extends BoxProps {
  variant?: TagVariant
}
export const TagV2 = ({ children, variant = 'default', ...props }: TagV2Props) => {
  return (
    <StyledTag $variant={variant} {...props}>
      {children}
    </StyledTag>
  )
}
