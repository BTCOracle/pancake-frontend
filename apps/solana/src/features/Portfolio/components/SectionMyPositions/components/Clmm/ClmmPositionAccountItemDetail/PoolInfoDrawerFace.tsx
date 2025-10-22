import { Badge, Box, HStack, Tag, Text, VStack } from '@chakra-ui/react'
import Decimal from 'decimal.js'
import { useTranslation } from '@pancakeswap/localization'
import TokenAvatarPair from '@/components/TokenAvatarPair'
import { FormattedPoolInfoConcentratedItem } from '@/hooks/pool/type'
import useClmmBalance, { ClmmPosition } from '@/hooks/portfolio/clmm/useClmmBalance'
import { colors } from '@/theme/cssVariables'
import toPercentString from '@/utils/numberish/toPercentString'
import { formatCurrency, formatToRawLocaleStr } from '@/utils/numberish/formatter'
import { Mobile } from '@/components/MobileDesktop'

export default function PoolInfoDrawerFace({
  poolInfo,
  baseIn,
  position
}: {
  poolInfo: FormattedPoolInfoConcentratedItem
  position: ClmmPosition
  baseIn: boolean
}) {
  const { t } = useTranslation()
  const { getPriceAndAmount } = useClmmBalance({})
  const { priceLower, priceUpper } = getPriceAndAmount({ poolInfo, position })
  const decimals = Math.max(poolInfo.mintA.decimals, poolInfo.mintB.decimals)
  const inRange = priceLower.price.lt(poolInfo.price) && priceUpper.price.gt(poolInfo.price)
  const rangeValue = baseIn
    ? `${formatCurrency(priceLower.price, {
        decimalPlaces: decimals
      })} - ${formatCurrency(priceUpper.price, {
        decimalPlaces: decimals
      })}`
    : `${formatCurrency(new Decimal(1).div(priceUpper.price), {
        decimalPlaces: decimals
      })} - ${formatCurrency(new Decimal(1).div(priceLower.price), {
        decimalPlaces: decimals
      })}`
  const rangeValueUnit = t('%subA%/%subB%', {
    subA: poolInfo[baseIn ? 'mintB' : 'mintA'].symbol,
    subB: poolInfo[baseIn ? 'mintA' : 'mintB'].symbol
  })
  return (
    <VStack spacing={3}>
      <TokenAvatarPair size="40px" token1={poolInfo.mintA} token2={poolInfo.mintB} />

      {/* pool name */}
      <HStack>
        <Box fontSize="md" fontWeight={600} color={colors.textPrimary}>
          {poolInfo.mintA.symbol} / {poolInfo.mintB.symbol}
        </Box>
        <Tag size={['sm', 'md']} variant="rounded">
          {formatToRawLocaleStr(toPercentString(poolInfo.feeRate * 100))}
        </Tag>
      </HStack>

      <HStack fontSize="sm" flexWrap="wrap" justify="center">
        <Text whiteSpace="nowrap">{rangeValue}</Text>
        <Text color={colors.textSubtle} whiteSpace="nowrap">
          {rangeValueUnit}
        </Text>
        <Mobile>
          <br />
        </Mobile>
        <Badge variant={inRange ? 'ok' : 'error'}>{inRange ? t('In Range') : t('Out of Range')}</Badge>
      </HStack>
    </VStack>
  )
}
