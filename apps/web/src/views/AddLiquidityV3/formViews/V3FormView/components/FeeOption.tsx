import { useTranslation } from '@pancakeswap/localization'
import { AutoColumn, Skeleton, Text } from '@pancakeswap/uikit'
import { FeeAmount } from '@pancakeswap/v3-sdk'
import { PoolState } from 'hooks/v3/types'
import { useFeeTierDistribution } from 'hooks/v3/useFeeTierDistribution'
import { styled } from 'styled-components'

import { LightSecondaryCard } from '@pancakeswap/widgets-internal'
import { FEE_AMOUNT_DETAIL } from './shared'

const FeeOptionContainer = styled.div<{ active: boolean }>`
  cursor: pointer;
  height: 100%;

  border-radius: 16px;
  padding: 2px 2px 4px 2px;
  &:hover {
    opacity: 0.7;
  }
`

interface FeeOptionProps {
  feeAmount: FeeAmount
  largestUsageFeeTier?: FeeAmount
  active: boolean
  distributions: ReturnType<typeof useFeeTierDistribution>['distributions']
  poolState: PoolState
  onClick: () => void
  isLoading?: boolean
}

export function FeeOption({
  feeAmount,
  active,
  poolState,
  distributions,
  onClick,
  largestUsageFeeTier,
  isLoading,
}: FeeOptionProps) {
  const { t } = useTranslation()

  return (
    <FeeOptionContainer active={active} onClick={onClick}>
      <LightSecondaryCard $active={active} padding="10px 8px" height="100%">
        <AutoColumn gap="sm" justify="flex-start" height="100%" justifyItems="center">
          <Text textAlign="center" color={active ? 'invertedContrast' : 'textSubtle'} bold>
            {FEE_AMOUNT_DETAIL[feeAmount].label}% {feeAmount === largestUsageFeeTier && '🔥'}
          </Text>
          {isLoading ? (
            <Skeleton width="100%" height={16} />
          ) : distributions ? (
            <Text fontSize="12px" color={active ? 'invertedContrast' : 'textSubtle'}>
              {!distributions || poolState === PoolState.NOT_EXISTS || poolState === PoolState.INVALID
                ? t('Not Created')
                : distributions[feeAmount] !== undefined
                ? `${distributions[feeAmount]?.toFixed(0)}% ${t('Pick')}`
                : t('No Data')}
            </Text>
          ) : null}
        </AutoColumn>
      </LightSecondaryCard>
    </FeeOptionContainer>
  )
}
