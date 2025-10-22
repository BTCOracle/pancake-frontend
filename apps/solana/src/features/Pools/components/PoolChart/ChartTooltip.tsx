import { Box } from '@chakra-ui/react'
import { TooltipProps } from 'recharts'
import { NameType, ValueType } from 'recharts/src/component/DefaultTooltipContent'

import { toUTC } from '@/utils/date'
import { formatCurrency } from '@/utils/numberish/formatter'
import { colors } from '@/theme/cssVariables'
import { panelCard } from '@/theme/cssBlocks'

export type IChartTooltipProps = TooltipProps<ValueType, NameType> & { category?: string; symbol?: string; unit?: string }

export default function ChartTooltip({ active, payload, label, category, symbol, unit = '' }: IChartTooltipProps) {
  // const unit = 'USD'
  if (active && payload && payload.length) {
    return (
      <Box {...panelCard} px="4" py="2" lineHeight="1.5">
        <Box color={colors.textSubtle} fontSize="xs">
          {category}
        </Box>
        {payload.map((item, idx) => {
          return (
            <Box key={`payload-${item.name}-${idx}`} color={colors.textPrimary} fontSize="14px" fontWeight="600">
              <Box>{`${formatCurrency(item.value as string, { symbol, decimalPlaces: 2 })} ${unit}`}</Box>
            </Box>
          )
        })}
        <Box color={colors.textSubtle} fontSize="xs">
          {toUTC(label)}
        </Box>
      </Box>
    )
  }

  return null
}
