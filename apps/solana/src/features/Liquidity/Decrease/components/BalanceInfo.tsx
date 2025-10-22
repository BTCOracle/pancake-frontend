import { Flex, Text, VStack } from '@chakra-ui/react'
import { useTranslation } from '@pancakeswap/localization'
import { formatCurrency } from '@/utils/numberish/formatter'

import { colors } from '@/theme/cssVariables'
import { DecreaseTabOptionType } from './type'

type BalanceInfoProps = {
  currentTab: DecreaseTabOptionType['value'] | undefined
  stakedLiquidity: number | string
  unstakedLiquidity: number | string
}

export default function BalanceInfo({ currentTab, stakedLiquidity, unstakedLiquidity }: BalanceInfoProps) {
  const { t } = useTranslation()

  return (
    <Flex borderBottomRadius="24px" direction="column" w="full" px="24px" py="24px" bg={colors.backgroundLight}>
      <VStack w="full" align="flex-start" spacing={3}>
        <Text fontSize="sm" color={colors.textSecondary}>
          {t('My LP balance')}
        </Text>
        <Flex
          w="full"
          justify="space-between"
          color={currentTab === 'Unstake Liquidity' ? colors.textPrimary : colors.textSecondary}
          fontWeight={currentTab === 'Unstake Liquidity' ? 'medium' : 'normal'}
          fontSize="sm"
        >
          <Text>{t('Staked Liquidity')}</Text>
          <Text>{formatCurrency(stakedLiquidity)}</Text>
        </Flex>

        <Flex
          w="full"
          justify="space-between"
          color={currentTab === 'Remove Liquidity' ? colors.textPrimary : colors.textSecondary}
          fontWeight={currentTab === 'Remove Liquidity' ? 'medium' : 'normal'}
          fontSize="sm"
        >
          <Text>{t('Unstaked Liquidity')}</Text>
          <Text>{formatCurrency(unstakedLiquidity)}</Text>
        </Flex>
      </VStack>
    </Flex>
  )
}
