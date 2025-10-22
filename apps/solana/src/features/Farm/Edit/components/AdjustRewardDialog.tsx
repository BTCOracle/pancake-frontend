import { useState } from 'react'
import { useTranslation } from '@pancakeswap/localization'
import {
  Box,
  Flex,
  HStack,
  Heading,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spacer,
  Text,
  VStack
} from '@chakra-ui/react'
import { ApiV3Token, wSolToSolToken } from '@pancakeswap/solana-core-sdk'
import Decimal from 'decimal.js'
import Button from '@/components/Button'
import CalloutNote from '@/components/CalloutNote'
import DecimalInput from '@/components/DecimalInput'
import TokenInput from '@/components/TokenInput'
import { useAppStore, useTokenAccountStore } from '@/store'
import { colors } from '@/theme/cssVariables'
import { useEvent } from '@/hooks/useEvent'
import { parseDateInfo, toUTC, DAY_SECONDS, WEEK_SECONDS } from '@/utils/date'
import { getDuration } from '@/utils/duration'
import { formatCurrency, formatToRawLocaleStr } from '@/utils/numberish/formatter'
import toPercentString from '@/utils/numberish/toPercentString'
import { wSolToSolString } from '@/utils/token'
import useTokenPrice, { TokenPrice } from '@/hooks/token/useTokenPrice'
import { MAX_DURATION_DAYS, MIN_DURATION_DAYS } from '@/store/configs/farm'
import { EditReward } from '../util'
import useAdjustRewardSchema, { ADJUST_REWARD_ERROR } from '../schema/useAdjustRewardSchema'

/**
 * used in [FarmingRewardItem](./FarmingRewardItem.tsx)
 */
export default function AdjustRewardDialog({
  farmTVL,
  oldReward,
  isOpen,
  onClose,
  onSave
}: {
  farmTVL?: number
  oldReward: EditReward
  isOpen: boolean
  onSave: (reward: EditReward) => void
  onClose?(): void
}) {
  const { t } = useTranslation()
  const chainTimeOffset = useAppStore((s) => s.chainTimeOffset)
  const getTokenBalanceUiAmount = useTokenAccountStore((s) => s.getTokenBalanceUiAmount)

  const [daysExtend, setDaysExtend] = useState('')
  const [moreAmount, setMoreAmount] = useState('')

  const rewardToken = wSolToSolToken(oldReward.mint)
  const onlineCurrentDate = Date.now() + chainTimeOffset
  const oldPerSecond = new Decimal(oldReward.perWeek).div(WEEK_SECONDS)
  const remainSeconds = new Decimal(Math.floor(oldReward.endTime / 1000 - onlineCurrentDate / 1000))
  const remainAmount = new Decimal(oldPerSecond).mul(remainSeconds)

  const { data: tokenPrices } = useTokenPrice({
    mintList: [rewardToken.address]
  })

  const newPerSecond = new Decimal(remainAmount).add(moreAmount || 0).div(new Decimal(daysExtend || 0).mul(DAY_SECONDS).add(remainSeconds))
  const isDecrease = newPerSecond.lt(oldPerSecond)

  const newTotal = remainAmount.add(moreAmount || 0).toString()

  const newEndTime = new Decimal(daysExtend || 0)
    .mul(DAY_SECONDS * 1000)
    .add(oldReward.endTime)
    .toNumber()

  const newApr =
    moreAmount || daysExtend
      ? newPerSecond
          .mul(DAY_SECONDS * 365)
          .mul(tokenPrices[rewardToken.address]?.value || 0)
          .div(farmTVL || 1)
          .toNumber()
      : oldReward.apr

  const error = useAdjustRewardSchema({
    oldReward,
    daysExtend,
    balance: getTokenBalanceUiAmount({ mint: rewardToken.address, decimals: rewardToken.decimals }).text,
    amount: moreAmount,
    onlineCurrentDate,
    remainSeconds,
    isDecrease
  })

  const invalid = !!error && error !== (ADJUST_REWARD_ERROR.DECREASE as unknown as string)

  const handleSave = useEvent(() => {
    onSave({
      ...oldReward,
      total: newTotal,
      openTime: Date.now() + chainTimeOffset + 30 * 1000, // 30 seconds as buffer
      endTime: new Decimal(oldReward.endTime).add(new Decimal(daysExtend || 0).mul(DAY_SECONDS * 1000)).toNumber(),
      perWeek: newPerSecond.mul(WEEK_SECONDS).toString(),
      perDay: newPerSecond.mul(DAY_SECONDS).toString(),
      status: 'updated',
      apr: newApr
    })
  })

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        onClose?.()
      }}
      size="2xl"
    >
      <ModalOverlay />
      <ModalContent borderRadius="24px">
        <ModalHeader>{t('Adjust rewards')}</ModalHeader>
        <ModalCloseButton />

        <ModalBody mb={5} overflow="scroll">
          <VStack spacing={4} align="stretch">
            <Box>
              <Heading fontSize="md" color={colors.textSubtle} fontWeight={600} mb={3}>
                {t('Current rewards period')}
              </Heading>
              <RewardInfoItem
                tokenPrices={tokenPrices}
                mint={oldReward.mint}
                amount={remainAmount.toString()}
                openTime={oldReward.openTime}
                endTime={oldReward.endTime}
                perWeek={oldReward.perWeek}
                perDay={oldReward.perDay}
                apr={oldReward.apr}
              />
            </Box>

            <Box>
              <Heading fontSize="md" color={colors.textSubtle} fontWeight={600} mb={3}>
                {t('Rewards adjustment')}
              </Heading>
              <HStack align="stretch" spacing={6}>
                <TokenInput
                  token={rewardToken}
                  disableSelectToken
                  value={moreAmount}
                  // onTokenChange={onTokenChange}
                  onChange={setMoreAmount}
                />
                <VStack bg={colors.cardSecondary} border="1px solid" borderColor={colors.cardBorder01} rounded="24px" p={4} align="start">
                  <Text fontSize="xs" color={colors.textSubtle}>
                    {t('Days Extends')}
                  </Text>
                  <Spacer />
                  <HStack>
                    <DecimalInput
                      inputSx={{
                        bg: 'transparent',
                        p: 0,
                        fontSize: 'lg',
                        padding: '16px',
                        fontWeight: 500,
                        _hover: { bg: 'transparent' },
                        _active: { bg: 'transparent' },
                        _focusWithin: { bg: 'transparent' }
                      }}
                      inputGroupSx={{
                        px: 0
                      }}
                      placeholder="0"
                      value={daysExtend}
                      onChange={setDaysExtend}
                    />
                    <Text color={colors.textSubtle} fontSize="xs" fontWeight={600}>
                      {t('Days')}
                    </Text>
                  </HStack>
                </VStack>
              </HStack>
            </Box>
            <Text color="red">{error ? t(error, { token: rewardToken.symbol }) : undefined}</Text>
            {!invalid ? (
              <Box>
                <Heading fontSize="md" color={colors.textSecondary} fontWeight={500} mb={3}>
                  {t('Updated rewards')}
                </Heading>
                <RewardInfoItem
                  tokenPrices={tokenPrices}
                  mint={oldReward.mint}
                  amount={newTotal.toString()}
                  endTime={newEndTime}
                  openTime={oldReward.openTime}
                  perWeek={newPerSecond.mul(WEEK_SECONDS).toString()}
                  perDay={newPerSecond.mul(DAY_SECONDS).toString()}
                  apr={newApr}
                />
              </Box>
            ) : null}
          </VStack>
        </ModalBody>

        <ModalFooter mt={4}>
          <HStack w="full" justify="space-between">
            <Button variant="outline" onClick={onClose}>
              {t('Cancel')}
            </Button>
            <Button minW="16rem" onClick={handleSave} isDisabled={invalid}>
              {t('Save')}
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

function RewardInfoItem(props: {
  mint: ApiV3Token
  amount: string
  openTime: number
  endTime: number
  perWeek: string
  perDay: string
  apr: number
  tokenPrices: Record<string, TokenPrice>
}) {
  const { t } = useTranslation()
  const periodLessThanWeek = props.endTime - props.openTime <= 1000 * DAY_SECONDS * 7
  return (
    <Flex overflow="hidden" align="stretch" rounded="20px" fontSize="sm">
      <Flex direction="column" flexGrow={1}>
        <Box
          bg={colors.cardSecondary}
          border="1px solid"
          borderRadius="20px 0 0 0"
          borderBottom="none"
          borderColor={colors.cardBorder01}
          py={3}
          px={6}
        >
          <Text color={colors.textSubtle}>{t('Remaining amount')}</Text>
        </Box>
        <Box
          flexGrow={1}
          bg={colors.cardSecondary}
          border="1px solid"
          borderRadius="0 0 0 20px"
          borderColor={colors.cardBorder01}
          py={4}
          px={6}
        >
          <Text fontSize="md" fontWeight={500} color={colors.textPrimary} mb={3}>
            {formatCurrency(props.amount, { decimalPlaces: props.mint.decimals })}
          </Text>
          <Text fontSize="xs" color={colors.textSubtle}>
            {formatCurrency(new Decimal(props.amount).mul(props.tokenPrices[props.mint.address]?.value || 0).toString(), {
              symbol: '$',
              decimalPlaces: 2
            })}
          </Text>
        </Box>
      </Flex>
      <Flex direction="column" flexGrow={1}>
        <Box bg={colors.cardSecondary} borderTop="1px solid" borderColor={colors.cardBorder01} py={3} px={6}>
          <Text color={colors.textSubtle}>{t('Farming ends')}</Text>
        </Box>
        <Box
          flexGrow={1}
          bg={colors.cardSecondary}
          borderTop="1px solid"
          borderBottom="1px solid"
          borderColor={colors.cardBorder01}
          py={4}
          px={6}
        >
          <Text fontSize="md" fontWeight={500} color={colors.textPrimary} mb={3}>
            {toUTC(props.endTime)}
          </Text>
          <Text fontSize="xs" color={colors.textSubtle}>
            {t('%days%D remaining', { days: parseDateInfo(getDuration(props.endTime, Date.now())).day })}
          </Text>
        </Box>
      </Flex>
      <Flex direction="column" flexGrow={1}>
        <Box
          bg={colors.cardSecondary}
          border="1px solid"
          borderRadius="0 20px 0 0"
          borderBottom="none"
          borderColor={colors.cardBorder01}
          py={3}
          px={6}
        >
          <Text color={colors.textSubtle}>{t('Rate')}</Text>
        </Box>
        <Box
          flexGrow={1}
          bg={colors.cardSecondary}
          border="1px solid"
          borderRadius="0 0 20px 0"
          borderColor={colors.cardBorder01}
          py={4}
          px={6}
        >
          <Text fontSize="md" fontWeight={500} color={colors.textPrimary} mb={3}>
            {formatCurrency(props.perDay, { decimalPlaces: props.mint.decimals })}
            <Text display="inline" ml="2" color={colors.textSubtle}>
              {wSolToSolString(props.mint.symbol)}
              {t('/day')}
            </Text>
          </Text>
          <Text fontSize="xs" color={colors.textSubtle}>
            {formatToRawLocaleStr(toPercentString(props.apr))} {t('APR')}
          </Text>
        </Box>
      </Flex>
    </Flex>
  )
}
