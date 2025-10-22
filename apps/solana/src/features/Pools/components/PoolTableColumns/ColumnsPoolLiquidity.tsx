import { Box, HStack, Text } from '@chakra-ui/react'
import LockPercentCircle from '@/components/LockPercentCircle'
import { FormattedPoolInfoItem } from '@/hooks/pool/type'
import { formatCurrency } from '@/utils/numberish/formatter'

export const ColumnsPoolLiquidity: React.FC<{
  data: FormattedPoolInfoItem
}> = ({ data }) => {
  return (
    <HStack justify="flex-end" gap={2}>
      <Text fontSize={['sm', 'lg']} textAlign="right">
        {formatCurrency(data.tvl, { symbol: '$', decimalPlaces: 0 })}
      </Text>
      <Box minWidth="22px">
        {Math.abs(data.burnPercent || 0) > 5 && (
          <LockPercentCircle
            value={Math.abs(data.burnPercent || 0)}
            circularProps={{
              size: '22px',
              thickness: '8px'
            }}
          />
        )}
      </Box>
    </HStack>
  )
}
