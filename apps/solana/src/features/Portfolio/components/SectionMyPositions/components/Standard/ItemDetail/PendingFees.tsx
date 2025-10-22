import { useTranslation } from '@pancakeswap/localization'
import { Button, Flex, HStack, Text, Tooltip, VStack } from '@chakra-ui/react'
import Decimal from 'decimal.js'
import InfoCircleIcon from '@/icons/misc/InfoCircleIcon'
import { colors } from '@/theme/cssVariables'
import TokenAvatar from '@/components/TokenAvatar'
import { formatCurrency, getFirstNonZeroDecimal } from '@/utils/numberish/formatter'
import { FormattedPoolInfoStandardItem } from '@/hooks/pool/type'
import { CpmmLockData } from '@/hooks/portfolio/cpmm/useLockCpmmBalance'

type PendingFeesProps = {
  pendingFee: number | string
  poolInfo: FormattedPoolInfoStandardItem
  lockData: CpmmLockData
  onHarvest: (data: CpmmLockData) => void
}

export default function PendingFees({ pendingFee, poolInfo, lockData, onHarvest }: PendingFeesProps) {
  const { t } = useTranslation()
  const lpFees = new Decimal(lockData.positionInfo.unclaimedFee.lp).toFixed(20)
  const lpFeesAmountA = new Decimal(lockData.positionInfo.unclaimedFee.amountA).toFixed(20)
  const lpFeesAmountB = new Decimal(lockData.positionInfo.unclaimedFee.amountB).toFixed(20)

  const [lpDecimal, mintADecimal, mintBDecimal] = [
    Math.min(getFirstNonZeroDecimal(lpFees), poolInfo.lpMint.decimals),
    Math.min(getFirstNonZeroDecimal(lpFeesAmountA) + 1, poolInfo.mintA.decimals),
    Math.min(getFirstNonZeroDecimal(lpFeesAmountB) + 1, poolInfo.mintB.decimals)
  ]

  return (
    <Flex justify="space-between" bg={colors.backgroundDark} rounded="lg" py={2.5} px={4} gap={8}>
      <VStack align="flex-start" justifyContent="space-between">
        <Text fontSize="sm" color={colors.textTertiary}>
          {t('Pending fees')}
        </Text>
        <HStack color={colors.textSecondary}>
          <Text fontSize="sm" fontWeight="medium">
            {formatCurrency(pendingFee, { symbol: '$', abbreviated: true, decimalPlaces: 2 })}
          </Text>
          <Tooltip
            label={
              <Flex direction="column" gap={2} fontSize="sm">
                <Flex justifyContent="space-between" color={colors.lightPurple} gap={5}>
                  <Text opacity={0.6}>{t('Approx LP Fees')}</Text>
                  <Text>
                    {formatCurrency(lpFees, { decimalPlaces: lpDecimal })} {poolInfo.poolName.replace(' - ', '/')}
                  </Text>
                </Flex>
                <Text opacity={0.6}>{t('Approx Fee breakdown')}</Text>
                <Flex justifyContent="space-between" align="center">
                  <Flex gap={1}>
                    <TokenAvatar size="sm" token={poolInfo.mintA} />
                    <Flex>
                      <Text color={colors.textPrimary} pr={1}>
                        {formatCurrency(lpFeesAmountA, {
                          decimalPlaces: mintADecimal
                        })}
                      </Text>
                      <Text>{poolInfo.mintA.symbol}</Text>
                    </Flex>
                  </Flex>
                  <Flex gap={1}>
                    <TokenAvatar size="sm" token={poolInfo.mintB} />
                    <Flex>
                      <Text color={colors.textPrimary} pr={1}>
                        {formatCurrency(lpFeesAmountB, {
                          decimalPlaces: mintBDecimal
                        })}
                      </Text>
                      <Text>{poolInfo.mintB.symbol}</Text>
                    </Flex>
                  </Flex>
                </Flex>
              </Flex>
            }
          >
            <InfoCircleIcon />
          </Tooltip>
        </HStack>
      </VStack>
      <VStack justifyContent="flex-end">
        <Button
          isDisabled={lockData.positionInfo.unclaimedFee.lp === 0}
          variant="outline"
          size="sm"
          px={5}
          py={0}
          lineHeight={0}
          height="24px"
          rounded="8px"
          onClick={() => onHarvest(lockData)}
        >
          {t('Harvest')}
        </Button>
      </VStack>
    </Flex>
  )
}
