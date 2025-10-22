import { Flex, HStack, Text, VStack } from '@chakra-ui/react'
import { ApiV3Token } from '@pancakeswap/solana-core-sdk'
import { useTranslation } from '@pancakeswap/localization'
import { Skeleton, useMatchBreakpoints } from '@pancakeswap/uikit'
import Button from '@/components/Button'
import TokenAvatar from '@/components/TokenAvatar'
import { colors } from '@/theme/cssVariables'
import { formatCurrency } from '@/utils/numberish/formatter'
import { getMintSymbol } from '@/utils/token'
import Tooltip from '@/components/Tooltip'
import RewardBreakdownSwitch from '@/components/RewardBreakdownSwitch'
import { useAppStore } from '@/store'
import { BreakdownRewardInfo } from '@/hooks/pool/clmm/useFetchClmmRewardInfo'
import { QuestionToolTip } from '@/components/QuestionToolTip'

type PendingYieldProps = {
  pendingYield?: string
  isLoading?: boolean
  hasReward?: boolean
  rewardInfos: { mint: ApiV3Token; amount: string; amountUSD: string }[]
  breakdownRewardInfo: BreakdownRewardInfo
  isRewardLoading?: boolean
  onHarvest: () => void
}

export default function PendingYield({
  isLoading,
  hasReward,
  pendingYield,
  rewardInfos,
  breakdownRewardInfo,
  isRewardLoading,
  onHarvest
}: PendingYieldProps) {
  const { t } = useTranslation()
  const rewardBreakdownMode = useAppStore((s) => s.rewardBreakdownMode)
  const column = 'repeat(auto-fit, minmax(min(100%, 155px), 1fr))'
  const { isMobile } = useMatchBreakpoints()

  const rewards = (
    <>
      {rewardBreakdownMode === 'Aggr' || !breakdownRewardInfo.rewards.length ? (
        <Flex display="grid" gridTemplateColumns={column} columnGap={2} rowGap={2}>
          {rewardInfos.map((r, index) => (
            <Flex key={r.mint.address} alignItems="center" gap={1} justifyContent="start">
              <TokenAvatar key={`pool-reward-${r.mint.address}`} size="sm" token={r.mint} />
              <Text color={colors.textPrimary}>
                {formatCurrency(r.amount, {
                  abbreviated: true,
                  maximumDecimalTrailingZeroes: 2
                })}
              </Text>
              <Text color={colors.textSecondary} display={['block', 'none', 'block']}>
                {getMintSymbol({ mint: r.mint, transformSol: true })}
              </Text>
              <Text color={colors.textPrimary}>
                (
                {formatCurrency(r.amountUSD, {
                  symbol: '$',
                  abbreviated: true,
                  maximumDecimalTrailingZeroes: 2
                })}
                )
              </Text>
            </Flex>
          ))}
        </Flex>
      ) : (
        <>
          <Text>{t('Trade Fees')}</Text>
          {breakdownRewardInfo.fee.A?.mint && breakdownRewardInfo.fee.B?.mint ? (
            <Flex display="grid" gridTemplateColumns={column} columnGap={2} rowGap={2}>
              <Flex alignItems="center" gap={1} justifyContent="start">
                <TokenAvatar size="sm" token={breakdownRewardInfo.fee.A.mint} />
                <Text color={colors.textPrimary}>
                  {formatCurrency(breakdownRewardInfo.fee.A.amount, {
                    abbreviated: true,
                    maximumDecimalTrailingZeroes: 2
                  })}
                </Text>
                <Text color={colors.textSecondary} display={['block', 'none', 'block']}>
                  {getMintSymbol({ mint: breakdownRewardInfo.fee.A.mint, transformSol: true })}
                </Text>
                <Text color={colors.textPrimary}>
                  (
                  {formatCurrency(breakdownRewardInfo.fee.A.amountUSD, {
                    symbol: '$',
                    abbreviated: true,
                    maximumDecimalTrailingZeroes: 2
                  })}
                  )
                </Text>
              </Flex>
              <Flex alignItems="center" gap={1} justifyContent="start">
                <TokenAvatar size="sm" token={breakdownRewardInfo.fee.B.mint} />
                <Text color={colors.textPrimary}>
                  {formatCurrency(breakdownRewardInfo.fee.B.amount, {
                    abbreviated: true,
                    maximumDecimalTrailingZeroes: 2
                  })}
                </Text>
                <Text color={colors.textSecondary} display={['block', 'none', 'block']}>
                  {getMintSymbol({ mint: breakdownRewardInfo.fee.B.mint, transformSol: true })}
                </Text>
                <Text color={colors.textPrimary}>
                  (
                  {formatCurrency(breakdownRewardInfo.fee.B.amountUSD, {
                    symbol: '$',
                    abbreviated: true,
                    maximumDecimalTrailingZeroes: 2
                  })}
                  )
                </Text>
              </Flex>
            </Flex>
          ) : null}
          {breakdownRewardInfo.rewards.length > 0 ? (
            <>
              <Text>{t('Farm Rewards')}</Text>
              <Flex display="grid" gridTemplateColumns={column} columnGap={2} rowGap={2}>
                {breakdownRewardInfo.rewards.map((r, index) => (
                  <Flex key={r.mint.address} alignItems="center" gap={1} justifyContent="start">
                    <TokenAvatar key={`pool-reward-${r.mint.address}`} size="sm" token={r.mint} />
                    <Text color={colors.textPrimary}>
                      {formatCurrency(r.amount, {
                        abbreviated: true,
                        maximumDecimalTrailingZeroes: 2
                      })}
                    </Text>
                    <Text color={colors.textSecondary} display={['block', 'none', 'block']}>
                      {getMintSymbol({ mint: r.mint, transformSol: true })}
                    </Text>
                    <Text color={colors.textPrimary}>
                      (
                      {formatCurrency(r.amountUSD, {
                        symbol: '$',
                        abbreviated: true,
                        maximumDecimalTrailingZeroes: 2
                      })}
                      )
                    </Text>
                  </Flex>
                ))}
              </Flex>
            </>
          ) : null}
        </>
      )}
    </>
  )

  return (
    <Flex flex={1} justify="space-around" w="full" fontSize="sm" flexDirection="column" gap={3} p={[4, 0]}>
      <HStack justifyContent="space-between">
        {isMobile ? (
          <VStack alignItems="flex-start">
            <HStack>
              <Text color={colors.textSecondary} whiteSpace="nowrap">
                {t('Pending Yield')}
              </Text>
              {breakdownRewardInfo.rewards.length > 0 ? <RewardBreakdownSwitch /> : null}
            </HStack>
            <HStack>
              <Text fontSize="xl" whiteSpace="nowrap" color={colors.primary}>
                {pendingYield ?? '$0'}
              </Text>
              <QuestionToolTip
                label={t('Pending rewards are calculated based on the current pool size and the time since the last harvest.')}
                iconType="info"
                iconProps={{
                  width: '18px',
                  height: '18px',
                  color: colors.textSubtle
                }}
              />
            </HStack>
          </VStack>
        ) : (
          <HStack>
            <Text color={colors.textSecondary} whiteSpace="nowrap">
              {t('Pending Yield')}
            </Text>
            <Text color={colors.textPrimary} whiteSpace="nowrap">
              ({pendingYield ?? '$0'})
            </Text>
            {breakdownRewardInfo.rewards.length > 0 ? <RewardBreakdownSwitch /> : null}
          </HStack>
        )}
        <Tooltip
          label={
            hasReward
              ? t('Harvest Rewards')
              : t('No rewards to harvest yet. Check back later — your earnings will grow as users trade in this pool.')
          }
        >
          <Button
            isLoading={isLoading}
            isDisabled={!hasReward}
            onClick={onHarvest}
            size="sm"
            fontSize="md"
            variant="outline"
            borderColor={colors.primary}
            color={colors.primary60}
            borderRadius="12px"
          >
            {t('Harvest')}
          </Button>
        </Tooltip>
      </HStack>
      {isRewardLoading ? (
        <Flex display="grid" gridTemplateColumns={column} columnGap={2} rowGap={2}>
          <Skeleton height="20px" width="100%" />
          <Skeleton height="20px" width="100%" />
        </Flex>
      ) : (
        rewards
      )}
    </Flex>
  )
}
