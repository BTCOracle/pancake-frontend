import { Flex, Text } from '@chakra-ui/react'
import { useTranslation } from '@pancakeswap/localization'
import { ApiV3Token } from '@pancakeswap/solana-core-sdk'

import { colors } from '@/theme/cssVariables'
import { formatCurrency } from '@/utils/numberish/formatter'

type StakedValueProps = {
  positionUsd: string
  staked: {
    token: ApiV3Token | undefined
    amount: string
  }
}

export default function StakedValue({ positionUsd, staked }: StakedValueProps) {
  const { t } = useTranslation()
  return (
    <Flex flex={2} direction="column" justify="space-between" gap={[1, 2]}>
      <Text fontSize="sm" color={colors.textSecondary}>
        {t('My Staked RAY')}
      </Text>
      <Text fontSize="lg" color={colors.textPrimary} fontWeight="500">
        {formatCurrency(staked.amount)} {staked.token?.symbol}
      </Text>
      <Text fontSize="xs" color={colors.textTertiary}>
        {formatCurrency(positionUsd, { symbol: '$', decimalPlaces: 2 })}
      </Text>
    </Flex>
  )
}
