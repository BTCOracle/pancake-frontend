import { useMemo } from 'react'
import { useTranslation } from '@pancakeswap/localization'
import { Flex, Box, Text } from '@chakra-ui/react'
import { colors } from '@/theme/cssVariables/colors'
import { AprKey } from '@/hooks/pool/type'

interface Props {
  currentPrice: string
  currentPriceLabel: string
  timePrice: string
  timeBase: AprKey
}

export default function ChartPriceLabel({ currentPrice, currentPriceLabel, timePrice, timeBase }: Props) {
  const { t } = useTranslation()

  const timeLabel = useMemo(() => {
    const TIME_MAP = {
      [AprKey.Day]: t('24 hour'),
      [AprKey.Week]: t('7 day'),
      [AprKey.Month]: t('1 month')
    }
    return TIME_MAP[timeBase]
  }, [t, timeBase])

  return (
    <Flex gap={[0, 2]} flexDirection="column" justifyContent="center">
      <Flex gap="2">
        <Flex flexDirection={['row', 'column']} gap={[2, 2]}>
          <Flex flexDirection="row" gap="4px" alignItems="center">
            <Box width="8px" height="8px" bg={colors.textSubtle} rounded="full" />
            <Text fontSize="xs" color={colors.textSubtle}>
              {t('Current Price')}
            </Text>
          </Flex>
          <Text fontSize="xs" fontWeight="600">
            {currentPrice}{' '}
            <Text as="span" color={colors.textSubtle} ml="5px">
              {currentPriceLabel}
            </Text>
          </Text>
        </Flex>
      </Flex>

      <Flex gap="2">
        <Flex flexDirection={['row', 'column']} gap={[2, 2]}>
          <Flex flexDirection="row" gap="4px" alignItems="center">
            <Box width="8px" height="8px" bg={colors.secondary} rounded="full" />
            <Text fontSize="xs" color={colors.textSubtle}>
              {t('%time% Price Range', {
                time: timeLabel
              })}
            </Text>
          </Flex>
          <Text fontSize="xs" fontWeight="600">
            [{timePrice}]
          </Text>
        </Flex>
      </Flex>
    </Flex>
  )
}
