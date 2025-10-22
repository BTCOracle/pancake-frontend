import { Box, Text, Tag, Flex, Grid, GridItem } from '@chakra-ui/react'
import { ApiV3Token } from '@pancakeswap/solana-core-sdk'
import TokenAvatarPair from '@/components/TokenAvatarPair'
import { colors } from '@/theme/cssVariables'
import toApr from '@/utils/numberish/toApr'
import { formatCurrency, formatToRawLocaleStr } from '@/utils/numberish/formatter'

interface FarmInfoItemProps {
  name: string
  token1: ApiV3Token
  token2: ApiV3Token
  tvl: string | number
  apr: string | number
  feeRate?: number
}

export default function FarmInfoItem({ name, token1, token2, tvl, apr, feeRate }: FarmInfoItemProps) {
  return (
    <Box
      fontWeight={500}
      rounded="xl"
      bg={colors.cardBg}
      px={5}
      py={4}
      border="1px solid"
      borderColor={colors.cardBorder01}
      borderRadius="24px"
    >
      <Flex alignItems={['flex-start', 'center']} gap="2" justifyContent="space-between" flexDirection={['column', 'row']}>
        <Flex alignItems="center" gap="2">
          <TokenAvatarPair token1={token1} token2={token2} />
          <Text fontSize="lg" whiteSpace="nowrap" fontWeight="600">
            {name}
          </Text>
          {feeRate ? (
            <Tag size="sm" variant="rounded">
              {feeRate * 100}%
            </Tag>
          ) : null}
        </Flex>
        <Grid mt="2" templateColumns="1fr 1fr" gap="2" width="100%">
          <GridItem textAlign={['left', 'center']}>
            <Text fontSize="xs" fontWeight={500} color={colors.textTertiary}>
              TVL
            </Text>
            <Text>{formatCurrency(tvl, { symbol: '$', decimalPlaces: 2 })}</Text>
          </GridItem>
          <GridItem textAlign={['left', 'center']}>
            <Text fontSize="xs" fontWeight={500} color={colors.textTertiary}>
              APR
            </Text>
            <Text>{formatToRawLocaleStr(toApr({ val: apr, multiply: false }))}</Text>
          </GridItem>
        </Grid>
      </Flex>
    </Box>
  )
}
