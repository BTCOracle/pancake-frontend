import { Box, HStack, Text } from '@chakra-ui/react'
import { ApiV3Token } from '@pancakeswap/solana-core-sdk'
import Decimal from 'decimal.js'
import { useTranslation } from '@pancakeswap/localization'
import { colors } from '@/theme/cssVariables'
import toPercentString from '@/utils/numberish/toPercentString'
import { formatCurrency, formatToRawLocaleStr } from '@/utils/numberish/formatter'
import { useTokenAccountStore } from '@/store'

export default function StandardPoolRowStakeFarmHoldItem({
  apr,
  lpMint,
  lpPrice
}: {
  apr?: number | string
  lpMint: ApiV3Token
  lpPrice: number
}) {
  const { t } = useTranslation()
  const getTokenBalanceUiAmount = useTokenAccountStore((s) => s.getTokenBalanceUiAmount)
  const unStaked = getTokenBalanceUiAmount({ mint: lpMint.address, decimals: lpMint.decimals })

  if (unStaked.isZero) return null

  return (
    <Box
      display="flex"
      flexDirection={['column', 'row']}
      py={[3, 2]}
      px={[4, 8]}
      gap={[1, 8]}
      bg={colors.backgroundTransparent12}
      borderRadius="xl"
      w="full"
      justifyContent="center"
      flexWrap="wrap"
    >
      <Text>
        {t('Unstaked LP')}: {formatCurrency(new Decimal(unStaked.amount).toString(), { decimalPlaces: lpMint.decimals })}
      </Text>
      <HStack spacing={8}>
        <HStack>
          <Text color={colors.textSecondary}>{t('Position')}</Text>
          <Text>{formatCurrency(new Decimal(unStaked.amount).mul(lpPrice).toString(), { symbol: '$', decimalPlaces: 2 })}</Text>
        </HStack>

        <HStack>
          <Text color={colors.textSecondary}>{t('APR')}</Text>
          <Text>{formatToRawLocaleStr(toPercentString(apr))}</Text>
        </HStack>
      </HStack>
    </Box>
  )
}
