import { useState } from 'react'
import { Badge, Box, Button, Flex, Grid, GridItem, HStack, SimpleGrid, Tag, Text, VStack, useDisclosure } from '@chakra-ui/react'
import { TokenInfo } from '@pancakeswap/solana-core-sdk'

import { useTranslation } from '@pancakeswap/localization'
import Decimal from 'decimal.js'
import TokenAvatar from '@/components/TokenAvatar'
import { useEvent } from '@/hooks/useEvent'
import { useAppStore } from '@/store'
import { colors } from '@/theme/cssVariables'
import { DAY_SECONDS } from '@/utils/date'
import { formatCurrency } from '@/utils/numberish/formatter'
import { wSolToSolString } from '@/utils/token'
import { TxCallbackProps } from '@/types/tx'

import { EditReward, FarmStatus, getRewardMeta } from '../util'
import AddMoreRewardDialog from './AddMoreRewardDialog'
import AdjustRewardDialog from './AdjustRewardDialog'

export default function ExistFarmingRewardItem({
  reward,
  remainingReward,
  farmTVL,
  isEcosystem,
  onRewardUpdate,
  tokenFilterFn,
  onClaimRemaining
}: {
  reward: EditReward
  remainingReward?: { hasRemaining: boolean; mint: string; remaining: string }
  farmTVL?: number
  isEcosystem: boolean
  tokenFilterFn?: (token: TokenInfo, escapeExistMint?: string) => boolean
  onRewardUpdate: (mint: string, reward?: EditReward, orgReward?: EditReward) => void
  onClaimRemaining?: (props: { mint: string } & TxCallbackProps) => void
}) {
  const { t } = useTranslation()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const chainTimeOffset = useAppStore((s) => s.chainTimeOffset)
  const onlineCurrentDate = Date.now() + chainTimeOffset

  const [currentReward, setCurrentReward] = useState<EditReward>(reward)
  const [rewardTag, setRewardTag] = useState(Date.now())

  const rewardToken = reward.mint
  const periodLessThanWeek = reward.endTime - reward.openTime <= 1000 * DAY_SECONDS * 7
  const { startDateText, startTimeText, endDateText, endTimeText, durationText } = getRewardMeta(reward)
  const {
    startDateText: newStartDateText,
    startTimeText: newStartTimeText,
    endDateText: newEndDateText,
    endTimeText: newEndTimeText,
    durationText: newDurationText
  } = getRewardMeta(currentReward)

  const [currentStatus, setCurrentStatus] = useState<FarmStatus>(reward.status)

  const filterFn = useEvent((token: TokenInfo) => {
    if (!tokenFilterFn) return true
    return tokenFilterFn(token, reward.mint.address)
  })

  const isNewRewards = currentStatus === 'new'
  const isUpdated = currentStatus === 'updated'

  const statusInfo = {
    ongoing: {
      color: colors.semanticSuccess,
      text: t('Ongoing'),
      indicators: ['badge']
    },
    ended: {
      color: colors.semanticError,
      text: t('Ended'),
      indicators: ['badge', 'top-line']
    },
    updated: {
      color: colors.badgePurple,
      text: t('Updated'),
      indicators: ['tag', 'top-line']
    },
    new: {
      color: colors.badgeBlue,
      text: t('New'),
      indicators: ['tag', 'top-line']
    }
  }

  const isRewardEnded = reward.status === 'ended'
  const isIn72hrPeriod = reward.endTime - onlineCurrentDate <= 1000 * DAY_SECONDS * 3 && reward.endTime > onlineCurrentDate
  const isEcoSystemAddMore = isEcosystem && isIn72hrPeriod

  const canAddMoreRewards = reward.endTime - onlineCurrentDate <= 1000 * DAY_SECONDS * 3
  const remainingRewardAmount = new Decimal(remainingReward?.remaining || 0).div(10 ** reward.mint.decimals)
  const claimableRewardAmount: string | undefined =
    onClaimRemaining && isRewardEnded && remainingReward && remainingRewardAmount.gt(0) ? remainingRewardAmount.toString() : undefined

  const { isOpen: isAdjustRewardDialogOpen, onOpen: onOpenAdjustRewardDialog, onClose: onCloseAdjustRewardDialog } = useDisclosure()
  const { isOpen: isAddMoreRewardDialogOpen, onOpen: onOpenAddMoreRewardDialog, onClose: onCloseAddMoreRewardDialog } = useDisclosure()
  const { isOpen: isEditDialogOpen, onOpen: onOpenEditDialog, onClose: onCloseEditDialog } = useDisclosure()

  const onClaim = async () => {
    onOpen()
    onClaimRemaining?.({ mint: reward.mint.address, onError: onClose, onFinally: onClose })
  }

  const onReset = useEvent(() => {
    setCurrentStatus(reward.status)
    setCurrentReward(reward)
    setRewardTag(Date.now())
    onRewardUpdate(reward.mint.address)
  })

  const onSave = useEvent((adjustedReward: EditReward) => {
    onCloseEditDialog()
    onCloseAddMoreRewardDialog()
    onCloseAdjustRewardDialog()
    setCurrentStatus(adjustedReward.status)
    setCurrentReward(adjustedReward)
    onRewardUpdate(adjustedReward.mint.address, adjustedReward, isNewRewards ? reward : undefined)
  })

  const onDeleteNewReward = useEvent(() => {
    onRewardUpdate(reward.mint.address)
  })

  return (
    <>
      {/* item body */}
      <Grid
        position="relative"
        overflow="hidden"
        gridAutoFlow="column"
        gridTemplate={[
          `
              "label    per-week" auto
              "duration duration" auto / 1fr 1fr
            `,
          `
              "label per-week duration duration" auto / 1fr 1.3fr 2fr
            `
        ]}
        fontWeight={500}
        rounded="xl"
        bg={colors.cardBg}
        border="1px solid"
        borderColor={colors.cardBorder01}
        borderRadius={isUpdated ? '24px 24px 0 0' : '24px'}
        justifyContent="space-between"
        px={12}
        py={6}
      >
        {currentStatus && statusInfo[currentStatus]?.indicators.includes('top-line') && (
          <GridItem area="top-line" position="absolute" top={0} left={0} right={0}>
            <Box height={0.5} bg={statusInfo[currentStatus]?.color ?? 'transparent'} />
          </GridItem>
        )}

        <GridItem area="label">
          <VStack alignItems="start" gap="1">
            <Flex gap="2" alignItems="center">
              <TokenAvatar size="sm" token={rewardToken} />
              <Text fontSize="md" fontWeight="600">
                {rewardToken?.symbol}
              </Text>
              {currentStatus === 'ongoing' && statusInfo[currentStatus]?.indicators.includes('badge') && (
                <Badge variant="ok">{statusInfo[currentStatus].text}</Badge>
              )}
              {currentStatus === 'ended' && statusInfo[currentStatus]?.indicators.includes('badge') && (
                <Badge variant="error">{statusInfo[currentStatus].text}</Badge>
              )}
              {currentStatus && statusInfo[currentStatus]?.indicators.includes('tag') && (
                <Tag variant="parallelogram" bg={statusInfo[currentStatus].color}>
                  {statusInfo[currentStatus].text}
                </Tag>
              )}
            </Flex>
          </VStack>
        </GridItem>

        <GridItem area="per-week">
          <Box opacity={isUpdated ? 0.5 : 1}>
            <Text fontWeight="600">{formatCurrency(reward.total, { decimalPlaces: 4 })}</Text>
            <HStack fontSize="sm">
              <Text color={colors.textSubtle}>
                {formatCurrency(reward.perDay, { decimalPlaces: 4 })}
                {t('/day')}
              </Text>
            </HStack>
          </Box>
        </GridItem>

        <GridItem area="duration">
          <HStack spacing={4} opacity={isUpdated ? 0.5 : 1}>
            <VStack>
              <Text>{startDateText}</Text>
              <Text>{startTimeText}</Text>
            </VStack>

            {/* divider */}
            <Box fontSize="sm" position="relative">
              <Text position="absolute" top={-2} left="50%" transform="translateX(-50%)" color={colors.textSubtle} whiteSpace="nowrap">
                {durationText}
              </Text>
              <Box height="1.5px" width={12} bg={colors.textTertiary} my={4} />
            </Box>

            <HStack>
              <VStack>
                <Text>{endDateText}</Text>
                <Text>{endTimeText}</Text>
              </VStack>
              <Text fontSize="sm" color={colors.textSubtle}>
                (UTC)
              </Text>
            </HStack>
          </HStack>
        </GridItem>
      </Grid>

      {isUpdated && (
        <SimpleGrid
          position="relative"
          overflow="hidden"
          gridAutoFlow="column"
          gridTemplateColumns="1fr 1.3fr 2fr"
          fontWeight={500}
          roundedBottomLeft="xl"
          roundedBottomRight="xl"
          bg={colors.cardBg}
          border="1px solid"
          borderColor={colors.cardBorder01}
          borderTop="none"
          borderRadius="0 0 24px 24px"
          justifyContent="space-between"
          px={6}
          py={3}
          mt="-5"
        >
          <VStack alignItems="start" gap="1" />

          <Box borderTop={`1px solid ${colors.backgroundTransparent12}`} pt="3">
            <Text fontWeight="600">{formatCurrency(currentReward.total, { decimalPlaces: 2 })}</Text>
            <HStack fontSize="sm">
              <Text color={colors.textSubtle}>
                {formatCurrency(currentReward.perWeek, { decimalPlaces: 2 })}
                {t('/week')}
              </Text>
            </HStack>
          </Box>

          <HStack spacing={4} borderTop={`1px solid ${colors.backgroundTransparent12}`} pt="3">
            <VStack>
              <Text>{newStartDateText}</Text>
              <Text>{newStartTimeText}</Text>
            </VStack>

            {/* divider */}
            <Box fontSize="sm" position="relative">
              <Text position="absolute" top={-2} left="50%" transform="translateX(-50%)" color={colors.textSubtle} whiteSpace="nowrap">
                {newDurationText}
              </Text>
              <Box height="1.5px" width={12} bg={colors.textTertiary} my={4} />
            </Box>

            <HStack>
              <VStack>
                <Text>{newEndDateText}</Text>
                <Text>{newEndTimeText}</Text>
              </VStack>
              <Text>{newEndTimeText}</Text>
              <Text fontSize="sm" color={colors.textSubtle}>
                (UTC)
              </Text>
            </HStack>
          </HStack>
        </SimpleGrid>
      )}

      {/* action buttons */}
      <HStack justify="end" flexWrap="wrap" mb="2">
        {claimableRewardAmount && (
          <Button variant="outline" size="sm" isLoading={isOpen} onClick={onClaim}>
            <HStack>
              <Text>{t('Claim Unemmitted Rewards')}</Text>
              <Text color={colors.textSubtle} fontSize="xs">
                {formatCurrency(claimableRewardAmount, { decimalPlaces: reward.mint.decimals })} {wSolToSolString(rewardToken.symbol)}
              </Text>
            </HStack>
          </Button>
        )}
        {isUpdated && (
          <Button
            size="sm"
            variant="outline"
            border="1px solid"
            borderColor={colors.primary}
            bg={colors.cardBg}
            color={colors.primary60}
            _hover={{
              bg: colors.backgroundLight
            }}
            onClick={onReset}
          >
            {t('Reset')}
          </Button>
        )}
        {!isRewardEnded && !isEcosystem && !isNewRewards && !isUpdated && (
          <>
            <Button
              size="sm"
              onClick={onOpenAdjustRewardDialog}
              border="1px solid"
              borderColor={colors.primary}
              bg={colors.cardBg}
              color={colors.primary60}
              _hover={{
                bg: colors.backgroundLight
              }}
            >
              {t('Adjust rewards')}
            </Button>
            <AdjustRewardDialog
              key={rewardTag}
              oldReward={reward}
              farmTVL={farmTVL}
              isOpen={isAdjustRewardDialogOpen}
              onClose={onCloseAdjustRewardDialog}
              onSave={onSave}
            />
          </>
        )}
        {(isRewardEnded || isEcoSystemAddMore) && !isUpdated && (
          <>
            <Button
              size="sm"
              border="1px solid"
              borderColor={colors.primary}
              bg={colors.cardBg}
              color={colors.primary60}
              _hover={{
                bg: colors.backgroundLight
              }}
              onClick={onOpenAddMoreRewardDialog}
            >
              {t('Add More Rewards')}
            </Button>
            {isAddMoreRewardDialogOpen && (
              <AddMoreRewardDialog
                key={rewardTag}
                header="Add more rewards"
                isEcoSystemAddMore={isEcoSystemAddMore}
                defaultRewardInfo={reward}
                isOpen
                onSave={onSave}
                onClose={onCloseAddMoreRewardDialog}
              />
            )}
          </>
        )}

        {isNewRewards && (
          <Button size="sm" variant="outline" onClick={onDeleteNewReward}>
            {t('Delete')}
          </Button>
        )}
        {isNewRewards && (
          <>
            <Button size="sm" onClick={onOpenEditDialog}>
              {t('Edit')}
            </Button>
            <AddMoreRewardDialog
              key={rewardTag}
              tokenFilterFn={filterFn}
              header={t('Edit')}
              defaultRewardInfo={reward}
              isOpen={isEditDialogOpen}
              onSave={onSave}
              onClose={onCloseEditDialog}
            />
          </>
        )}
      </HStack>
    </>
  )
}
