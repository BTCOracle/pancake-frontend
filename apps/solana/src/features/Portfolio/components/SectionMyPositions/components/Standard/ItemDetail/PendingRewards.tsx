import { Badge, Box, Button, Flex, HStack, Text, Tooltip, VStack } from '@chakra-ui/react'
import Decimal from 'decimal.js'
import { useTranslation } from '@pancakeswap/localization'
import { ApiV3Token } from '@pancakeswap/solana-core-sdk'
import ExclaimationTriangle from '@/icons/misc/ExclaimationTriangle'
import InfoCircleIcon from '@/icons/misc/InfoCircleIcon'
import { colors } from '@/theme/cssVariables'
import TokenAvatar from '@/components/TokenAvatar'
import { formatCurrency } from '@/utils/numberish/formatter'
import { getMintSymbol } from '@/utils/token'

type PendingRewardsProps = {
  pendingReward: number | string
  rewardInfo: { mint: ApiV3Token; amount: string; amountUSD: string }[]
  positionStatus?: string
  isLoading: boolean
  onHarvest: () => void
}

export default function PendingRewards({ pendingReward, positionStatus, rewardInfo, isLoading, onHarvest }: PendingRewardsProps) {
  const { t } = useTranslation()
  const positionStandardPoolsStatusTags = {
    unstaked: t('Unstaked LP'),
    ended: t('Farm Inactive')
  }
  const isEmpty = !rewardInfo.some((r) => !new Decimal(r.amount).isZero())
  return (
    <Flex justify="space-between" bg={colors.backgroundDark} rounded="lg" py={[4, 2.5]} px={4} gap={8}>
      <VStack align="flex-start" justifyContent="space-between">
        <Text fontSize="sm" color={colors.textTertiary}>
          {t('Pending rewards')}
        </Text>
        <HStack color={colors.textSecondary}>
          <Text fontSize="sm" fontWeight="medium">
            {formatCurrency(pendingReward, { symbol: '$', abbreviated: true, decimalPlaces: 2 })}
          </Text>
          {rewardInfo.length > 0 ? (
            <Tooltip
              label={
                <>
                  {rewardInfo.map((r) => (
                    <Flex key={r.mint.address} alignItems="center" gap="1" my="2">
                      <TokenAvatar key={`pool-reward-${r.mint.address}`} size="sm" token={r.mint} />
                      <Text color={colors.textPrimary}>
                        {formatCurrency(r.amount, {
                          maximumDecimalTrailingZeroes: 5
                        })}
                      </Text>
                      <Text>{getMintSymbol({ mint: r.mint, transformSol: true })}</Text>
                      <Text color={colors.textPrimary}>({formatCurrency(r.amountUSD, { symbol: '$', decimalPlaces: 4 })})</Text>
                    </Flex>
                  ))}
                </>
              }
            >
              <InfoCircleIcon />
            </Tooltip>
          ) : null}
        </HStack>
      </VStack>

      <VStack justifyContent="flex-end">
        {positionStatus && (
          <Tooltip
            isDisabled={positionStatus !== 'unstaked'}
            label={
              <Box>
                <Text fontSize="sm" color={colors.textSecondary}>
                  {t('You have unstaked LP tokens that could be staked in a farm. Stake now')}
                </Text>
              </Box>
            }
          >
            <Badge variant="rounded" fontSize="xs" color={colors.semanticWarning}>
              <Box mr={1.5}>
                <ExclaimationTriangle width="12px" height="12px" />
              </Box>

              {positionStatus === 'ended' ? (
                <Tooltip label={t('Rewards have ended for this farm. You can unstake your LP tokens.')}>
                  <Text whiteSpace="break-spaces" textAlign="center">
                    {positionStandardPoolsStatusTags[positionStatus as keyof typeof positionStandardPoolsStatusTags]}
                  </Text>
                </Tooltip>
              ) : (
                <Text whiteSpace="break-spaces" textAlign="center">
                  {positionStandardPoolsStatusTags[positionStatus as keyof typeof positionStandardPoolsStatusTags]}
                </Text>
              )}
            </Badge>
          </Tooltip>
        )}
        <Button
          isLoading={isLoading}
          isDisabled={isEmpty}
          variant="outline"
          size="sm"
          px={5}
          py={0}
          lineHeight={0}
          height="24px"
          rounded="8px"
          onClick={onHarvest}
        >
          {t('Harvest')}
        </Button>
      </VStack>
    </Flex>
  )
}
