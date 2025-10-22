import { Box, Flex, HStack, Text, VStack } from '@chakra-ui/react'
import { useTranslation } from '@pancakeswap/localization'
import { useMemo } from 'react'
import { Desktop, Mobile } from '@/components/MobileDesktop'
import Tooltip from '@/components/Tooltip'
import { formatCurrency, formatToRawLocaleStr } from '@/utils/numberish/formatter'
import { FormattedPoolInfoItem } from '@/hooks/pool/type'
import LockPercentCircle from '@/components/LockPercentCircle'
import { colors } from '@/theme/cssVariables'
import { FILED_KEY, TimeBase, toAPRPercent } from '../../util'
import { PoolListItemAprLine } from '../PoolListItemAprLine'
import PoolListItemAprDetailPopoverContent from '../PoolListItemAprDetailPopoverContent'

export const ColumnPoolApr: React.FC<{
  data: FormattedPoolInfoItem
  timeBase: TimeBase
  value: number
}> = ({ data: pool, value, timeBase }) => {
  const { t } = useTranslation()
  const field = FILED_KEY[timeBase]
  const timeData = pool[field]

  const feeApr = pool?.allApr[field].find((s) => s.isTradingFee)
  const rewardApr = useMemo(() => pool?.allApr[field].filter((s) => !s.isTradingFee && !!s.token) || [], [field, pool?.allApr])
  const aprData = useMemo(
    () => ({
      fee: {
        apr: feeApr?.apr || 0,
        percentInTotal: feeApr?.percent || 0
      },
      rewards:
        rewardApr.map((r) => ({
          apr: r.apr,
          percentInTotal: r.percent,
          mint: r.token!
        })) || [],
      apr: rewardApr.reduce((acc, cur) => acc + cur.apr, 0) + (feeApr?.apr || 0)
    }),
    [feeApr?.apr, feeApr?.percent, rewardApr]
  )

  const aprToolTipLabel = useMemo(
    () => (
      <PoolListItemAprDetailPopoverContent
        rewardType={pool.rewardDefaultPoolInfos === 'Ecosystem' ? t('Ecosystem') : ''}
        aprData={aprData}
        weeklyRewards={pool.weeklyRewards}
      />
    ),
    [aprData, pool.rewardDefaultPoolInfos, pool.weeklyRewards, t]
  )

  return (
    <>
      <Desktop>
        <HStack justifyContent="flex-end" h="100%">
          <Tooltip usePortal variant="card" placement="top-end" label={aprToolTipLabel}>
            <Box width={['unset', '80px', '100px']} textAlign="right">
              <Text fontSize={['md', 'lg', 'xl']} fontWeight={500} whiteSpace="nowrap" textAlign="right" lineHeight="1.5">
                {formatToRawLocaleStr(toAPRPercent(value))}
              </Text>
              <PoolListItemAprLine aprData={aprData} />
            </Box>
          </Tooltip>
        </HStack>
      </Desktop>
      <Mobile>
        <Flex h="100%" w="100%" align="center" justifyContent="center">
          <Tooltip usePortal variant="card" placement="top-end" label={aprToolTipLabel}>
            <VStack justifyContent="space-between" h="100%" w="100%">
              <HStack gap={1} justifyContent="center">
                {(pool.burnPercent ?? 0) > 5 && (
                  <LockPercentCircle
                    value={pool.burnPercent ?? 0}
                    circularProps={{
                      size: '16px'
                    }}
                    iconProps={{
                      width: 10,
                      height: 10
                    }}
                  />
                )}
                <Text as="span" fontWeight={600} textAlign="right" lineHeight={1.5}>
                  {formatCurrency(timeData.volume, { symbol: '$', decimalPlaces: 0 })}
                </Text>
              </HStack>
              <HStack gap={1} justifyContent="center">
                <Text fontSize="sm" whiteSpace="nowrap" align="revert" color={colors.textSubtle} lineHeight={1.5}>
                  {formatToRawLocaleStr(toAPRPercent(timeData.apr))}
                </Text>
                <PoolListItemAprLine aprData={aprData} />
              </HStack>
            </VStack>
          </Tooltip>
        </Flex>
      </Mobile>
    </>
  )
}
