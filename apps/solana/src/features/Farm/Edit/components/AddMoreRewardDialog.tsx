import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from '@pancakeswap/localization'
import {
  Box,
  Flex,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  VStack,
  useDisclosure
} from '@chakra-ui/react'
import { TokenInfo, ApiV3Token } from '@pancakeswap/solana-core-sdk'
import Decimal from 'decimal.js'

import dayjs from 'dayjs'
import Button from '@/components/Button'
import TokenInput from '@/components/TokenInput'
import { useEvent } from '@/hooks/useEvent'
import { colors } from '@/theme/cssVariables'
import { DAY_SECONDS, parseDateInfo, WEEK_SECONDS } from '@/utils/date'
import { useAppStore, useTokenAccountStore } from '@/store'
import DatePickerModal from '@/components/FarmDatePickerModal'
import { formatToRawLocaleStr } from '@/utils/numberish/formatter'
import { wSolToSol, wsolToSolToken } from '@/utils/token'
import { EditReward } from '../util'
import useAddNewRewardSchema from '../schema/useAddNewRewardSchema'

/**
 * used in [FarmingRewardItem](../FarmingRewardItem.tsx)
 */
export default function AddMoreRewardDialog({
  header,
  defaultRewardInfo,
  isOpen,
  isEcoSystemAddMore,
  tokenFilterFn,
  onClose,
  onSave
}: {
  header: string
  defaultRewardInfo: EditReward
  isOpen: boolean
  isEcoSystemAddMore?: boolean
  tokenFilterFn?: (token: TokenInfo) => boolean
  onSave: (rewardInfos: EditReward) => void
  onClose(): void
}) {
  const { t } = useTranslation()
  const getTokenBalanceUiAmount = useTokenAccountStore((s) => s.getTokenBalanceUiAmount)
  const chainTimeOffset = useAppStore((s) => s.chainTimeOffset)
  const onlineCurrentDate = Date.now() + chainTimeOffset
  const isNewData = defaultRewardInfo.status === 'new'

  const [rewardInfo, setRewardInfos] = useState<EditReward>(
    isNewData
      ? defaultRewardInfo
      : {
          mint: defaultRewardInfo.mint,
          status: 'updated',
          total: '',
          openTime: 0,
          endTime: 0,
          perDay: isEcoSystemAddMore ? defaultRewardInfo.perDay : '',
          perWeek: isEcoSystemAddMore ? defaultRewardInfo.perWeek : '',
          apr: 0
        }
  )
  const rewardToken = rewardInfo.mint
  const { isOpen: isDatePickerOpen, onClose: onCloseDatePicker, onOpen: onOpenDatePicker } = useDisclosure()

  function onChange(partialInfo: Partial<EditReward>) {
    setRewardInfos((s) => ({ ...s, ...partialInfo }))
  }

  const onTokenChange = useEvent((mint: ApiV3Token) => {
    onChange({ ...rewardInfo, mint })
  })

  const onAmountChange = useEvent((valNumber: string) => {
    if (isEcoSystemAddMore) return
    const durations = rewardInfo.endTime && rewardInfo.openTime ? rewardInfo.endTime - rewardInfo.openTime : undefined
    const newPerWeek = durations ? new Decimal(valNumber || 0).div(durations / WEEK_SECONDS / 1000).toString() : undefined
    onChange({ ...rewardInfo, total: valNumber, perWeek: newPerWeek })
  })

  const handleRewardTimeChange = useEvent((startTime: number, endTime: number) => {
    if (isEcoSystemAddMore) {
      onChange({ ...rewardInfo, openTime: startTime, endTime })
      onCloseDatePicker()
      return
    }
    const amount = rewardInfo.total
    const durations = endTime && startTime ? endTime - startTime : undefined
    const newPerWeek = durations && amount ? new Decimal(amount).div(durations / WEEK_SECONDS / 1000).toString() : undefined
    onChange({ ...rewardInfo, openTime: startTime, endTime, perWeek: newPerWeek })
    onCloseDatePicker()
  })

  const farmOpenTimeInfo = useMemo(() => parseDateInfo(rewardInfo.openTime), [rewardInfo.openTime])
  const farmEndTimeInfo = useMemo(() => parseDateInfo(rewardInfo.endTime), [rewardInfo.endTime])

  useEffect(() => {
    if (!isEcoSystemAddMore || !rewardInfo.openTime || !rewardInfo.endTime || !rewardInfo.perWeek) return
    setRewardInfos((r) => ({
      ...r,
      total: new Decimal(rewardInfo.endTime - rewardInfo.openTime)
        .div(WEEK_SECONDS * 1000)
        .mul(new Decimal(rewardInfo.perWeek))
        .toString()
    }))
  }, [isEcoSystemAddMore, rewardInfo.openTime, rewardInfo.endTime, rewardInfo.perWeek])

  const error = useAddNewRewardSchema({
    onlineCurrentDate,
    balance: getTokenBalanceUiAmount({ mint: wSolToSol(rewardToken.address) ?? '', decimals: rewardToken.decimals }).text,
    amount: rewardInfo.total,
    endTime: rewardInfo.endTime,
    openTime: rewardInfo.openTime,
    mint: rewardInfo.mint
  })

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <ModalOverlay />
      <ModalContent borderRadius="24px">
        <ModalHeader>{header}</ModalHeader>
        <ModalCloseButton />

        <ModalBody mb={5} overflow="visible">
          <VStack spacing={4} align="stretch">
            <TokenInput
              readonly={isEcoSystemAddMore}
              filterFn={tokenFilterFn}
              disableSelectToken={!isNewData}
              token={wsolToSolToken(rewardToken)}
              hideControlButton
              value={rewardInfo.total}
              onTokenChange={onTokenChange}
              onChange={onAmountChange}
            />
            <Box borderRadius="24px" bg={colors.cardSecondary} border="1px solid" borderColor={colors.cardBorder01} py={3} px={6}>
              {!rewardInfo.openTime ? (
                <>
                  <Flex justify="space-between" mb={2}>
                    <Text fontSize="xs" fontWeight={300} color={colors.textSubtle}>
                      {t('Farming starts')}
                    </Text>
                    <Text fontSize="xs" fontWeight={300} color={colors.textSubtle}>
                      {t('Farming ends')}
                    </Text>
                  </Flex>
                  <Flex
                    cursor="pointer"
                    onClick={onOpenDatePicker}
                    bg={colors.textSubtle}
                    borderRadius="20px"
                    justify="center"
                    align="center"
                    py={1}
                    mt={4}
                  >
                    <Text fontWeight="medium" fontSize="md" color={colors.invertedContrast}>
                      {t('Select')}
                    </Text>
                  </Flex>
                </>
              ) : (
                <HStack justifyContent="space-between">
                  <Box cursor="pointer" onClick={onOpenDatePicker}>
                    <Text fontSize="xs" fontWeight={300} color={colors.textSubtle}>
                      {t('Farming starts')}
                    </Text>
                    <Text fontSize="md" fontWeight={500} color={colors.textPrimary} my={1} mb={2}>
                      {`${farmOpenTimeInfo.year}/${farmOpenTimeInfo.month}/${farmOpenTimeInfo.day}`}
                    </Text>
                    <Text fontSize="xs" color={colors.textSubtle}>
                      {`${farmOpenTimeInfo.hour}:${farmOpenTimeInfo.minutes} (UTC)`}
                    </Text>
                  </Box>
                  {rewardInfo.openTime && rewardInfo.endTime ? (
                    <Flex flexGrow={1} align="center">
                      <Box flexGrow={1} height="1px" color={colors.backgroundLight} bg={colors.dividerDashGradient} />
                      <Box
                        rounded="full"
                        bg={colors.textSubtle}
                        color={colors.invertedContrast}
                        py={2}
                        px={[4, 6]}
                        cursor="pointer"
                        onClick={onOpenDatePicker}
                      >
                        <Text fontWeight="500" fontSize="sm">
                          {(rewardInfo.endTime - rewardInfo.openTime) / (60 * 60 * 24 * 1000)} Days
                        </Text>
                      </Box>
                      <Box flexGrow={1} height="1px" color={colors.backgroundLight} bg={colors.dividerDashGradient} />
                    </Flex>
                  ) : null}
                  <Box textAlign="right">
                    <Text fontSize="xs" fontWeight={300} color={colors.textSubtle}>
                      {t('Farming ends')}
                    </Text>
                    <Text fontSize="md" fontWeight={500} color={colors.textPrimary} my={1} mb={2}>
                      {`${farmEndTimeInfo.year}/${farmEndTimeInfo.month}/${farmEndTimeInfo.day}`}
                    </Text>
                    <Text fontSize="xs" color={colors.textSubtle}>
                      {`${farmEndTimeInfo.hour}:${farmEndTimeInfo.minutes} (UTC)`}
                    </Text>
                  </Box>
                </HStack>
              )}
            </Box>
            <HStack
              justify="space-between"
              borderRadius="24px"
              bg={colors.cardSecondary}
              border="1px solid"
              borderColor={colors.cardBorder01}
              py={3}
              px={6}
            >
              <Text color={colors.textSubtle} fontSize="xs">
                {t('Estimated rewards / week')}
              </Text>
              <Text color={colors.textPrimary} fontSize="xl" fontWeight={600}>
                {rewardInfo.perWeek
                  ? formatToRawLocaleStr(
                      new Decimal(rewardInfo.perWeek || 0).toDecimalPlaces(rewardInfo.mint?.decimals || 6, Decimal.ROUND_FLOOR).toString()
                    )
                  : '--'}{' '}
                {rewardInfo.mint?.symbol}
              </Text>
            </HStack>

            <DatePickerModal
              isOpen={isDatePickerOpen}
              onConfirm={handleRewardTimeChange}
              onClose={() => onCloseDatePicker?.()}
              farmDuration={
                rewardInfo.endTime && rewardInfo.openTime
                  ? Math.floor((rewardInfo.endTime - rewardInfo.openTime) / DAY_SECONDS / 1000)
                  : undefined
              }
              farmStart={rewardInfo.openTime || dayjs(onlineCurrentDate).add(15, 'minutes').valueOf()}
            />
          </VStack>
          {error && (
            <Text mt="2" color="red">
              {t(error, { token: rewardInfo.mint.symbol })}
            </Text>
          )}
        </ModalBody>

        <ModalFooter>
          <HStack w="full" justify="space-between">
            <Button variant="outline" onClick={onClose}>
              {t('Cancel')}
            </Button>
            <Button minW="16rem" isDisabled={!!error} onClick={() => onSave(rewardInfo)}>
              {t('Save')}
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
