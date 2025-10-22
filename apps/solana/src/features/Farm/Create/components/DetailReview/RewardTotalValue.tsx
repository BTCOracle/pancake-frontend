import { useTranslation } from '@pancakeswap/localization'
import { HStack, Text } from '@chakra-ui/react'
import { colors } from '@/theme/cssVariables'
import { formatCurrency } from '@/utils/numberish/formatter'

export function RewardTotalValue(props: { total: number | string }) {
  const { t } = useTranslation()
  return (
    <HStack
      mt={4}
      spacing={4}
      bg={colors.cardBg}
      border="1px solid"
      borderColor={colors.cardBorder01}
      borderRadius="20px"
      py={4}
      px={[3, 10]}
      justify="end"
    >
      <Text fontSize="sm" fontWeight={500} color={colors.textSubtle}>
        {t('Total value')}
      </Text>
      <Text fontSize="md" fontWeight={600}>
        {formatCurrency(props.total, { symbol: '$', decimalPlaces: 2 })}
      </Text>
    </HStack>
  )
}
