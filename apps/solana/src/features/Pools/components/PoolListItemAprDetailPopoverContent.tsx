import { useTranslation } from '@pancakeswap/localization'
import { Badge, Box, Flex, Grid, HStack, VStack, useColorMode } from '@chakra-ui/react'
import Decimal from 'decimal.js'
import dayjs from 'dayjs'
import TokenAvatar from '@/components/TokenAvatar'
import { colors, sizes } from '@/theme/cssVariables'
import { WeeklyRewardData } from '@/hooks/pool/type'
import { AprData } from '@/features/Clmm/utils/calApr'
import useTokenPrice from '@/hooks/token/useTokenPrice'
import { wSolToSolString } from '@/utils/token'
import { formatCurrency, formatToRawLocaleStr } from '@/utils/numberish/formatter'
import { aprColors } from './PoolListItemAprLine'
import { PoolListItemAprPie } from './PoolListItemAprPie'
import { toAPRPercent } from '../util'

export default function PoolListItemAprDetailPopoverContent({
  aprData,
  rewardType,
  weeklyRewards
}: {
  aprData: AprData
  rewardType: string
  weeklyRewards: WeeklyRewardData
}) {
  const { t } = useTranslation()
  const { colorMode } = useColorMode()
  const isLight = colorMode === 'light'
  const { data: tokenPrices } = useTokenPrice({
    mintList: weeklyRewards.map((r) => r.token.address)
  })

  const haveWeeklyRewards =
    weeklyRewards.length > 0 &&
    weeklyRewards.some(
      (reward) => Number(reward.amount) !== 0 && (!reward.endTime || reward.endTime * 1000 > dayjs().subtract(10, 'day').valueOf())
    )
  return (
    <Flex flexDir="column" p={2} gap={4}>
      <Box>
        <Flex mb={2} alignItems="center" justifyContent="space-between">
          <Box fontSize={sizes.textSM} color={colors.textSubtle} fontWeight={600}>
            {t('Total APR')}
          </Box>
          <Box fontSize={sizes.textLG} fontWeight="medium" color={colors.textPrimary}>
            {formatToRawLocaleStr(parseFloat(aprData.apr.toFixed(2)))}%
          </Box>
        </Flex>
        {/* total apr */}
        <Grid templateColumns="auto 1fr" gap={8}>
          <PoolListItemAprPie aprs={aprData} />
          <Flex flexGrow={2} justify="space-between" align="center">
            <VStack flex={3}>
              <Flex w="full" gap={4} justify="space-between" align="center">
                <Flex fontSize={sizes.textXS} fontWeight="normal" color={colors.textSubtle} justify="flex-start" align="center">
                  <Box rounded="full" bg={aprColors[0]} w="7px" h="7px" mr="8px" />
                  {t('Trade fees')}
                </Flex>
                <Box fontSize={sizes.textXS} color={colors.textPrimary}>
                  {formatToRawLocaleStr(toAPRPercent(aprData.fee.apr))}
                </Box>
              </Flex>
              {aprData.rewards.map(({ apr, mint }, idx) => {
                const reward = weeklyRewards.find((r) => r.token.address === mint.address)
                if (!reward || reward.amount === '0') return null
                const isRewardEnded = reward.endTime ? reward.endTime * 1000 < Date.now() : true
                if (isRewardEnded) return null
                return (
                  <Flex w="full" gap={4} key={`reward-${mint?.symbol}-${idx}`} justify="space-between" align="center">
                    <Flex fontSize={sizes.textXS} fontWeight="normal" color={colors.textSubtle} justify="flex-start" align="center">
                      <Box rounded="full" bg={aprColors[idx + 1]} w="7px" h="7px" mr="8px" />
                      {wSolToSolString(mint?.symbol)}
                    </Flex>
                    <Box fontSize={sizes.textXS} color={colors.textPrimary}>
                      {formatToRawLocaleStr(toAPRPercent(apr))}
                    </Box>
                  </Flex>
                )
              })}
            </VStack>
          </Flex>
        </Grid>
      </Box>

      {haveWeeklyRewards && (
        <Box>
          <Flex mb={2} alignItems="center" justifyContent="space-between">
            <Box fontSize={sizes.textSM} color={colors.textSubtle} fontWeight={600}>
              {t('Weekly Rewards')}
            </Box>
            <Box fontSize="14px" fontWeight="normal" color={colors.textPrimary}>
              {rewardType && <Badge variant="crooked">{rewardType}</Badge>}
            </Box>
          </Flex>
          {/* total apr */}
          {weeklyRewards.map((reward) => {
            if (reward.amount === '0') return null
            const { startTime } = reward
            const { endTime } = reward
            const isRewardStarted = startTime ? startTime * 1000 < Date.now() : true
            const isRewardEnded = endTime ? endTime * 1000 < Date.now() : true

            if (isRewardEnded) return null
            return (
              <Flex gap={4} w="full" key={String(reward.token?.address)} justify="space-between" align="center" fontSize="12px" mt="8px">
                <HStack fontWeight="normal" color={colors.textSubtle} spacing="5px">
                  {isRewardStarted ? (
                    <TokenAvatar size="xs" token={reward.token} />
                  ) : (
                    <div style={{ filter: 'grayscale(100%)' }}>
                      <TokenAvatar size="xs" token={reward.token} />
                    </div>
                  )}
                  <Box color={colors.success}>{formatCurrency(reward.amount, { decimalPlaces: 1, abbreviated: true })}</Box>
                  <Box color={colors.textPrimary}>{wSolToSolString(reward.token?.symbol)}</Box>
                  <Box color={colors.textSubtle}>
                    (
                    {formatCurrency(new Decimal(tokenPrices[reward.token.address]?.value || 0).mul(reward.amount).toString(), {
                      symbol: '$',
                      abbreviated: true,
                      decimalPlaces: 2
                    })}
                    )
                  </Box>
                </HStack>
                {endTime ? (
                  <Box fontSize="10px" fontWeight="normal" color={colors.textSubtle}>
                    {isRewardStarted ? (isRewardEnded ? t('Ended') : t('Ends')) : t('Starts')}{' '}
                    {isRewardStarted
                      ? dayjs(endTime * 1000).format('MM/DD/YY')
                      : startTime
                      ? dayjs(startTime * 1000).format('MM/DD/YY')
                      : null}
                  </Box>
                ) : null}
              </Flex>
            )
          })}
        </Box>
      )}
    </Flex>
  )
}
