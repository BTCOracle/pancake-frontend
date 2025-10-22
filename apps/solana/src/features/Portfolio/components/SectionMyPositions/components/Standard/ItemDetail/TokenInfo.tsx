import { Flex, HStack, Text } from '@chakra-ui/react'
import { ApiV3Token } from '@pancakeswap/solana-core-sdk'

import { useTranslation } from '@pancakeswap/localization'
import Decimal from 'decimal.js'
import TokenAvatar from '@/components/TokenAvatar'
import { colors } from '@/theme/cssVariables'
import { formatCurrency } from '@/utils/numberish/formatter'

type TokenInfoProps = {
  base: {
    token: ApiV3Token | undefined
    amount: number | string
  }
  quote: {
    token: ApiV3Token | undefined
    amount: number | string
  }
}

export default function TokenPooledInfo({ base, quote }: TokenInfoProps) {
  const { t } = useTranslation()
  return (
    <Flex direction="column" justify="space-between" bg={colors.backgroundDark} rounded="lg" py={[4, 3]} px={4} gap={[4, 0]}>
      <Flex justify="space-between" align="center">
        <Text fontSize="sm" color={colors.textTertiary}>
          {t('Pooled %token%', { token: base.token?.symbol })}
        </Text>
        <HStack>
          <Text fontSize="sm" color={colors.textSecondary} fontWeight="medium">
            {formatCurrency(new Decimal(base.amount).toFixed(2, Decimal.ROUND_FLOOR), { abbreviated: true, decimalPlaces: 2 })}
          </Text>
          <TokenAvatar token={base.token} size="xs" />
        </HStack>
      </Flex>
      <Flex justify="space-between" align="center">
        <Text fontSize="sm" color={colors.textTertiary}>
          {t('Pooled %token%', { token: quote.token?.symbol })}
        </Text>
        <HStack>
          <Text fontSize="sm" color={colors.textSecondary} fontWeight="medium">
            {formatCurrency(new Decimal(quote.amount).toFixed(2, Decimal.ROUND_FLOOR), { abbreviated: true, decimalPlaces: 2 })}
          </Text>
          <TokenAvatar token={quote.token} size="xs" />
        </HStack>
      </Flex>
    </Flex>
  )
}
