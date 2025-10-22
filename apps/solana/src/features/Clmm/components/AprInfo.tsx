import { Box, Flex, HStack, Text } from '@chakra-ui/react'
import { useTranslation } from '@pancakeswap/localization'
import { Cell, Label, Pie, PieChart, ResponsiveContainer } from 'recharts'
import AprMDSwitchWidget from '@/components/AprMDSwitchWidget'
import Tabs from '@/components/Tabs'
import { TimeBasisOptionType, timeBasisOptions } from '@/hooks/pool/type'
import { useAppStore } from '@/store'
import { colors } from '@/theme/cssVariables/colors'
import toPercentString from '@/utils/numberish/toPercentString'
import { formatToRawLocaleStr } from '@/utils/numberish/formatter'
import { AprData } from '@/features/Clmm/utils/calApr'

export const PORTFOLIO_PIE_COLORS = [colors.chart03, colors.chart04, colors.chart02, colors.chart05, colors.chart06]

interface Props {
  aprData?: AprData
  value: TimeBasisOptionType['value']
  onChange: (val: TimeBasisOptionType['value']) => void
}

export default function EstimatedAprInfo({ aprData, value, onChange }: Props) {
  const isMobile = useAppStore((s) => s.isMobile)
  const { t } = useTranslation()

  return (
    <Box borderRadius="xl" borderWidth="1px" borderColor={colors.backgroundTransparent07} pt={[2, 4]}>
      <Flex justifyContent="space-between" alignItems="flex-start" mb={4}>
        <HStack>
          <Text variant="title" fontSize={['sm', 'md']} color={colors.textPrimary}>
            {t('Estimated APR')}
          </Text>
          <AprMDSwitchWidget />
        </HStack>
        <Tabs variant="subtle" scale={isMobile ? 'xs' : 'sm'} value={value} onChange={onChange} items={timeBasisOptions} />
      </Flex>
      <Flex gap="3" alignItems={['flex-start', 'center']} flexDirection={['column', 'row']}>
        <Flex gap="3" alignItems="center" flexDirection="row">
          <Text fontWeight="600" fontSize="sm">
            {formatToRawLocaleStr(toPercentString(aprData?.apr || 0))}
          </Text>
          {aprData?.apr ? (
            <Box>
              <ResponsiveContainer width={isMobile ? 48 : 60} height={isMobile ? 48 : 60}>
                <PieChart>
                  <Pie
                    data={aprData ? [aprData.fee, ...aprData.rewards] : []}
                    innerRadius={isMobile ? '75%' : '60%'}
                    outerRadius="100%"
                    fill="#8884d8"
                    paddingAngle={0}
                    dataKey="percentInTotal"
                    startAngle={90}
                    endAngle={450}
                    stroke=""
                  >
                    {aprData &&
                      aprData.rewards.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={PORTFOLIO_PIE_COLORS[index % PORTFOLIO_PIE_COLORS.length]} stroke="" />
                      ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </Box>
          ) : null}
        </Flex>

        <Flex flexWrap="wrap" columnGap={[2, 4, 6]} rowGap={1}>
          {aprData?.fee ? (
            <Flex alignItems="center" fontSize="sm" color={colors.textSubtle} gap="1">
              <Box w="7px" h="7px" bg={PORTFOLIO_PIE_COLORS[0]} rounded="full" />
              {t('Trade fees')}{' '}
              <Text color={colors.textPrimary} fontWeight="600">
                {aprData.fee.apr === 0 ? 0 : formatToRawLocaleStr(toPercentString(aprData.fee.apr || 0))}
              </Text>
            </Flex>
          ) : null}
          {aprData?.rewards.map((d, idx) =>
            d.apr === 0 ? null : (
              <Flex key={d.mint?.address || 'fees'} alignItems="center" gap="1" fontSize="sm" color={colors.textSubtle}>
                <Box w="7px" h="7px" bg={PORTFOLIO_PIE_COLORS[(idx + 1) % PORTFOLIO_PIE_COLORS.length]} rounded="full" />
                <Text color={colors.textSubtle}>{d.mint?.symbol}</Text>
                <Text color={colors.textPrimary} fontWeight="600">
                  {formatToRawLocaleStr(toPercentString(d.apr))}
                </Text>
              </Flex>
            )
          )}
        </Flex>
      </Flex>
    </Box>
  )
}
