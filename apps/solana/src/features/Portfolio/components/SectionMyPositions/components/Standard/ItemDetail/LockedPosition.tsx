import { Flex, Text, HStack } from '@chakra-ui/react'
import { useTranslation } from '@pancakeswap/localization'

import { colors } from '@/theme/cssVariables'
import { formatCurrency } from '@/utils/numberish/formatter'
import { QuestionToolTip } from '@/components/QuestionToolTip'
import LockPercentCircle from '@/components/LockPercentCircle'

type MyPositionProps = {
  positionUsd: number | string
  burnPercent: number
}

export default function LockedPosition({ positionUsd, burnPercent }: MyPositionProps) {
  const { t } = useTranslation()
  return (
    <Flex direction="column" justify="space-between" py={1}>
      <HStack align="end">
        <Text fontSize="sm" color={colors.textSecondary} maxWidth="60px">
          {t('Locked Liquidity')}
        </Text>
        <Flex mb={1}>
          <QuestionToolTip
            label={
              <Text as="span" fontSize="sm">
                {t(
                  'You previously permanently locked the LP tokens for this position, however trading fees earned are still fully claimable.'
                )}
              </Text>
            }
            iconType="info"
            iconProps={{ color: colors.textSecondary }}
          />
        </Flex>
      </HStack>

      <Flex fontSize="lg" color={colors.textPrimary} fontWeight="medium" gap="1" align="center">
        {formatCurrency(positionUsd, { symbol: '$', abbreviated: true, decimalPlaces: 2 })}
        {burnPercent > 5 && (
          <LockPercentCircle
            value={burnPercent}
            iconProps={{
              width: 10,
              height: 10
            }}
          />
        )}
      </Flex>
    </Flex>
  )
}
