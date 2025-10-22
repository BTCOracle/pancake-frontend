import { Box, Grid, GridItem, HStack } from '@chakra-ui/react'
import { FlexGap, SwapHorizIcon, Text } from '@pancakeswap/uikit'
import { ApiV3Token } from '@pancakeswap/solana-core-sdk'
import dayjs from 'dayjs'
import { useState } from 'react'
import Tabs from '@/components/Tabs'
import TokenAvatarPair from '@/components/TokenAvatarPair'
import { TimeType } from '@/hooks/pool/useFetchPoolKLine'
import { colors } from '@/theme/cssVariables'
import CandleChart from './CandleChart'

export function SwapKlinePanel({
  baseToken,
  quoteToken,
  timeType,
  untilDate,
  onDirectionToggle,
  onTimeTypeChange
}: {
  untilDate: number
  baseToken: ApiV3Token | undefined
  quoteToken: ApiV3Token | undefined
  timeType: TimeType
  onDirectionToggle?(): void
  onTimeTypeChange?(timeType: TimeType): void
}) {
  const [price, setPrice] = useState<
    | {
        current: number
        change: number
      }
    | undefined
  >()

  return (
    <>
      <Grid
        gridTemplate={`
        "name   tabs " auto
        "chartwrap chartwrap" 1fr / 1fr auto
      `}
        alignItems="center"
        height="100%"
      >
        <GridItem gridArea="name" marginLeft="4px" marginBottom="12px">
          <HStack spacing={2}>
            <TokenAvatarPair token1={baseToken} token2={quoteToken} />
            <HStack>
              <FlexGap gap="4px">
                <Text fontSize={20} bold>
                  {baseToken?.symbol}
                </Text>
                <Text fontSize={20} bold color="textSubtle">
                  /
                </Text>
                <Text fontSize={20} bold>
                  {quoteToken?.symbol}
                </Text>
              </FlexGap>
              <Box
                cursor="pointer"
                onClick={() => {
                  onDirectionToggle?.()
                }}
              >
                <SwapHorizIcon color={colors.primary60} />
              </Box>
              <Text fontSize="14px" color={colors.textSubtle} ml="24px">
                {dayjs().utc().format('YY/MM/DD HH:MM')}
              </Text>
            </HStack>
          </HStack>
        </GridItem>
        <GridItem gridArea="tabs" marginRight="8px" marginBottom="12px">
          <Tabs
            value={timeType}
            items={['15m', '1H', '4H', '1D', '1W']}
            onChange={(t: TimeType) => {
              onTimeTypeChange?.(t)
            }}
            tabItemSX={{ minWidth: '3.75em' }}
            style={{ marginLeft: 'auto' }}
          />
        </GridItem>
        <GridItem area="chartwrap" height="100%">
          <Grid
            gridTemplate={`
            "price  price" auto
            "chart  chart" 1fr / 1fr auto
            `}
            alignItems="center"
            cursor="pointer"
            paddingLeft="16px"
            height="100%"
            bg={colors.backgroundAlt}
            borderRadius="8px"
          >
            <CandleChart onPriceChange={setPrice} baseMint={baseToken} quoteMint={quoteToken} timeType={timeType} untilDate={untilDate} />
          </Grid>
        </GridItem>
      </Grid>
    </>
  )
}
