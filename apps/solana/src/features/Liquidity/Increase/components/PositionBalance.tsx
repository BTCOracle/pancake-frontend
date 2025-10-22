import { Flex, Text } from '@chakra-ui/react'
import { useTranslation } from '@pancakeswap/localization'
import { formatCurrency, formatToRawLocaleStr } from '@/utils/numberish/formatter'

import { colors } from '@/theme/cssVariables'
import { panelCard } from '@/theme/cssBlocks'

type PositionBalanceProps = {
  myPosition: string | number
  staked: string | number
  unstaked: string | number
}

export default function PositionBalance({ myPosition = '345.02', staked = '256.45', unstaked = '0' }: PositionBalanceProps) {
  const { t } = useTranslation()
  return (
    <Flex {...panelCard} py="22px" px="24px" bg={[colors.backgroundDark, colors.backgroundLight]} borderRadius="20px" direction="column">
      <Flex justify="space-between" align="center">
        <Text color={colors.textSecondary} fontSize="sm">
          {t('My Position')}
        </Text>
        <Text color={colors.textSecondary} fontSize="sm" opacity={0.5}>
          {formatCurrency(myPosition, { symbol: '$' })}
        </Text>
      </Flex>
      <Flex mt={4}>
        <Text color={colors.textSecondary} fontSize="sm">
          {t('LP Token Balances')}
        </Text>
      </Flex>
      <Flex justify="space-between" align="center" mt="10px">
        <Text color={colors.textSecondary} fontSize="sm" opacity={0.5}>
          {t('Staked')}
        </Text>
        <Text color={colors.textSecondary} fontSize="sm" fontWeight="medium">
          {formatCurrency(staked)}
        </Text>
      </Flex>
      <Flex justify="space-between" align="center" mt={2}>
        <Text color={colors.textSecondary} fontSize="sm" opacity={0.5}>
          {t('Unstaked.status')}
        </Text>
        <Text color={colors.textSecondary} fontSize="sm" fontWeight="medium">
          {formatToRawLocaleStr(unstaked)}
        </Text>
      </Flex>
    </Flex>
  )
}
