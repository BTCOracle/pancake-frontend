import { Box, Flex, HStack, Text, useDisclosure } from '@chakra-ui/react'
import { ApiV3Token, TokenInfo } from '@pancakeswap/solana-core-sdk'
import { useMemo } from 'react'
import Decimal from 'decimal.js'
import { useTranslation } from '@pancakeswap/localization'
import TokenInput from '@/components/TokenInput'
import { colors } from '@/theme/cssVariables'

import { useEvent } from '@/hooks/useEvent'
import { parseDateInfo } from '@/utils/date'
import FarmDatePickerModal from '@/components/FarmDatePickerModal'
import { formatToRawLocaleStr } from '@/utils/numberish/formatter'
import { useAppStore, useClmmStore } from '@/store'
import { NewRewardInfo } from '../../type'

type RewardBodyProps = {
  rewardInfo: NewRewardInfo
  onChange: (rewardInfo: NewRewardInfo) => void
  tokenFilterFn: (token: ApiV3Token) => boolean
  maxRewardCount?: number
}

export default function RewardBody({ rewardInfo, tokenFilterFn, onChange, maxRewardCount }: RewardBodyProps) {
  const { isOpen, onClose, onOpen } = useDisclosure()
  const { t } = useTranslation()

  const onTokenChange = useEvent((token: TokenInfo | ApiV3Token) => {
    onChange({ ...rewardInfo, token })
  })
  const onAmountChange = useEvent((valNumber: string) => {
    const durations = rewardInfo.farmEnd && rewardInfo.farmStart ? rewardInfo.farmEnd - rewardInfo.farmStart : undefined
    const newPerWeek = durations ? new Decimal(valNumber || 0).div(durations / (60 * 60 * 24 * 1000 * 7)).toString() : undefined
    onChange({ ...rewardInfo, amount: valNumber, perWeek: newPerWeek })
  })
  const handleRewardTimeChange = useEvent((startTime: number, endTime: number) => {
    const { amount } = rewardInfo
    const durations = endTime && startTime ? endTime - startTime : undefined
    const newPerWeek = durations && amount ? new Decimal(amount).div(durations / (60 * 60 * 24 * 1000 * 7)).toString() : undefined
    onChange({ ...rewardInfo, farmStart: startTime, farmEnd: endTime, perWeek: newPerWeek })
    onClose()
  })
  const farmStartTimeInfo = useMemo(() => parseDateInfo(rewardInfo.farmStart), [rewardInfo.farmStart])
  const farmEndTimeInfo = useMemo(() => parseDateInfo(rewardInfo.farmEnd), [rewardInfo.farmEnd])

  return (
    <Box>
      <Text fontWeight="500" fontSize={['sm', 'md']} color={colors.textSubtle} mt={[1, 2]}>
        <span>isOp: {maxRewardCount}</span>
        {t('You can add up to %count% reward tokens.', {
          count: maxRewardCount
        })}
      </Text>
      <Flex direction="column" gap={4} mt={4} px={1}>
        <TokenInput
          hideControlButton
          token={rewardInfo.token}
          value={rewardInfo.amount?.toString()}
          onTokenChange={onTokenChange}
          onChange={onAmountChange}
          filterFn={tokenFilterFn}
        />
        <Box borderRadius="20px" bg={colors.cardSecondary} py={4} px={[4, 5]} border="1px solid" borderColor={colors.cardBorder01}>
          {!rewardInfo.farmStart ? (
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
                onClick={onOpen}
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
              <Box cursor="pointer" onClick={onOpen}>
                <Text fontSize="xs" fontWeight={300} color={colors.textSubtle}>
                  {t('Farming starts')}
                </Text>
                <Text fontSize="md" fontWeight={500} my={2}>
                  {`${farmStartTimeInfo.year}/${farmStartTimeInfo.month}/${farmStartTimeInfo.day}`}
                </Text>
                <Text fontSize="xs" color={colors.textSubtle}>
                  {`${farmStartTimeInfo.hour}:${farmStartTimeInfo.minutes} (UTC)`}
                </Text>
              </Box>
              {rewardInfo.farmStart && rewardInfo.farmEnd ? (
                <Flex flexGrow={1} align="center">
                  <Box flexGrow={1} height="1px" color={colors.backgroundLight} bg={colors.dividerDashGradient} />
                  <Box
                    rounded="full"
                    bg={colors.textSubtle}
                    color={colors.invertedContrast}
                    py={2}
                    px={[4, 6]}
                    cursor="pointer"
                    onClick={onOpen}
                  >
                    <Text fontWeight="500" fontSize="sm">
                      {(rewardInfo.farmEnd - rewardInfo.farmStart) / (60 * 60 * 24 * 1000)} {t('Days')}
                    </Text>
                  </Box>
                  <Box flexGrow={1} height="1px" color={colors.backgroundLight} bg={colors.dividerDashGradient} />
                </Flex>
              ) : null}
              <Box textAlign="right">
                <Text fontSize="xs" fontWeight={300} color={colors.textSubtle}>
                  {t('Farming ends')}
                </Text>
                <Text fontSize="md" fontWeight={500} my={2}>
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
          flexDirection={['column', 'row']}
          align={['unset', 'center']}
          justify="space-between"
          borderRadius="20px"
          bg={colors.cardSecondary}
          border="1px solid"
          borderColor={colors.cardBorder01}
          p={4}
        >
          <Text color={colors.textSubtle} fontSize="xs">
            {t('Estimated rewards / week')}
          </Text>
          <Text fontSize="xl" fontWeight={600}>
            {formatToRawLocaleStr(
              new Decimal(rewardInfo.perWeek || 0).toDecimalPlaces(rewardInfo.token?.decimals || 6, Decimal.ROUND_FLOOR).toString()
            )}{' '}
            {rewardInfo.token?.symbol}
          </Text>
        </HStack>

        <FarmDatePickerModal
          isOpen={isOpen}
          onConfirm={handleRewardTimeChange}
          onClose={onClose}
          farmDuration={
            rewardInfo.farmEnd && rewardInfo.farmStart
              ? Math.floor((rewardInfo.farmEnd - rewardInfo.farmStart) / (60 * 60 * 24 * 1000))
              : undefined
          }
          farmStart={rewardInfo.farmStart}
        />
      </Flex>
    </Box>
  )
}
