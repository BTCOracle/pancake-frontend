import { Box, Flex, HStack, Text } from '@chakra-ui/react'
import { ApiV3Token } from '@pancakeswap/solana-core-sdk'
import { useTranslation } from '@pancakeswap/localization'
import Tabs from '@/components/Tabs'
import { AprData } from '@/features/Clmm/utils/calApr'
import { aprColors } from '@/features/Pools/components/PoolListItemAprLine'
import { AprKey, TimeAprData, TimeBasisOptionType, timeBasisOptions } from '@/hooks/pool/type'
import { colors } from '@/theme/cssVariables'
import { formatToRawLocaleStr } from '@/utils/numberish/formatter'
import toPercentString from '@/utils/numberish/toPercentString'

type EstimatedAprProps = {
  timeBasis: AprKey
  aprData: AprData
  onTimeBasisChange?: (val: AprKey) => void
  timeAprData: TimeAprData
  defaultTimeBasis?: TimeBasisOptionType['value']
  poolId: string
}

export default function EstimatedApr({ aprData, timeBasis, onTimeBasisChange, poolId }: EstimatedAprProps) {
  const { t } = useTranslation()

  const tradeFee = aprData.fee
  const rewards = [{ ...tradeFee, mint: undefined as ApiV3Token | undefined }, ...aprData.rewards]

  return (
    <HStack flex={1} flexDirection={['row', 'column', 'row']} alignItems="stretch" justify="space-between" fontSize="sm">
      <Flex flexDirection="column" gap={[1, 2]} width="160px">
        {rewards.map(({ apr, mint }, idx) => (
          <Flex key={mint ? mint.address : `tradefee${poolId}`} justifyContent="space-between">
            <Flex alignItems="center">
              <Box
                key={idx}
                style={{
                  width: '7px',
                  height: '7px',
                  left: '0px',
                  top: '6px',
                  background: aprColors[idx],
                  borderRadius: '10px'
                }}
              />
              <Text ml={1.5} color={colors.lightPurple} whiteSpace="nowrap">
                {mint ? mint.symbol : t('Trade fees')}
              </Text>
            </Flex>
            <Text color={colors.textPrimary}>{apr === 0 ? 0 : formatToRawLocaleStr(toPercentString(apr))}</Text>
          </Flex>
        ))}
      </Flex>
      {onTimeBasisChange ? (
        <Flex alignItems={['center', 'start']} justifyContent={['center', 'start']}>
          <Tabs value={timeBasis} items={timeBasisOptions} onChange={onTimeBasisChange} size="xs" variant="subtle" />
        </Flex>
      ) : null}
    </HStack>
  )
}
