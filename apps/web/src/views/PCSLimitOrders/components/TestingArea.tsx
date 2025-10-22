import { useAtomValue } from 'jotai'
import { Card, CardBody, Text, Box, Flex, FlexGap } from '@pancakeswap/uikit'
import { stringify } from 'viem/utils'
import { useMemo } from 'react'
import { inputCurrencyAtom, outputCurrencyAtom } from '../state/currency/currencyAtoms'
import { ticksAtom } from '../state/form/ticksAtom'
import { selectedPoolAtom } from '../state/pools/selectedPoolAtom'
import { presetPercentMapAtom } from '../state/form/quickActionAtoms'
import { currentMarketPriceAtom } from '../state/form/currentMarketPriceAtom'

const TickVisualization = ({ ticksData, selectedPool }: { ticksData: any; selectedPool: any }) => {
  const ticks = useMemo(() => {
    if (!ticksData || !selectedPool?.pool?.tickCurrent) return []

    const { tickCurrent } = selectedPool.pool
    const allTicks = [
      { value: ticksData.tickLower, type: 'bounds', label: 'Lower' },
      { value: ticksData.tickUpper, type: 'bounds', label: 'Upper' },
      { value: tickCurrent, type: 'current', label: 'Current' },
    ].filter((tick) => tick.value !== undefined)

    // Sort by tick value for proper positioning
    return allTicks.sort((a, b) => a.value - b.value)
  }, [ticksData, selectedPool])

  if (ticks.length === 0) return null

  const minTick = Math.min(...ticks.map((t) => t.value))
  const maxTick = Math.max(...ticks.map((t) => t.value))
  const range = maxTick - minTick || 1

  const getColor = (type: string) => {
    switch (type) {
      case 'bounds':
        return '#1FC7D4' // Cyan for tickLower and tickUpper
      case 'current':
        return '#ED4B9E' // Pink for tickCurrent
      default:
        return '#666'
    }
  }

  return (
    <Box mt="16px">
      <Text bold mb="8px">
        Tick Visualization
      </Text>
      <Box position="relative" height="100px" bg="backgroundAlt" borderRadius="8px" p="16px">
        {/* Horizontal line with padding */}
        <Box
          position="absolute"
          top="50%"
          left="48px"
          right="48px"
          height="2px"
          bg="textSubtle"
          style={{ transform: 'translateY(-50%)' }}
        />

        {/* Tick markers */}
        {ticks.map((tick, index) => {
          // Add 20% padding on each side of the range
          const paddedRange = range * 1.4
          const offset = range * 0.2
          const position = ((tick.value - minTick + offset) / paddedRange) * 100
          return (
            <Box key={`${tick.type}-${tick.value}`} position="absolute" left={`calc(48px + ${position}%)`}>
              {/* Tick mark */}
              <Box
                position="absolute"
                top="100%"
                width="3px"
                height="20px"
                bg={getColor(tick.type)}
                style={{ transform: 'translate(-50%, -50%)' }}
                borderRadius="2px"
              />

              {/* Label - moved higher up */}
              <Box
                position="absolute"
                top="8px"
                style={{
                  transform: 'translateX(-50%)',
                  whiteSpace: 'nowrap',
                }}
              >
                <Text fontSize="10px" color={getColor(tick.type)} fontWeight="bold">
                  {tick.label}
                </Text>
              </Box>

              {/* Value - moved higher up */}
              <Box
                position="absolute"
                bottom="8px"
                style={{
                  transform: 'translateX(-50%)',
                  whiteSpace: 'nowrap',
                }}
              >
                <Text fontSize="9px" color="textSubtle">
                  {tick.value}
                </Text>
              </Box>
            </Box>
          )
        })}
      </Box>

      {/* Legend with better spacing */}
      <FlexGap mt="12px" gap="24px" flexWrap="wrap" justifyContent="center">
        <FlexGap alignItems="center" gap="6px">
          <Box width="12px" height="12px" bg="#1FC7D4" borderRadius="2px" />
          <Text fontSize="12px">Bounds (Lower/Upper)</Text>
        </FlexGap>
        <FlexGap alignItems="center" gap="6px">
          <Box width="12px" height="12px" bg="#ED4B9E" borderRadius="2px" />
          <Text fontSize="12px">Current</Text>
        </FlexGap>
        <FlexGap alignItems="center" gap="6px">
          <Box width="12px" height="12px" bg="#FFB237" borderRadius="2px" />
          <Text fontSize="12px">Inverted</Text>
        </FlexGap>
      </FlexGap>
    </Box>
  )
}

export const TestingArea = () => {
  const inputCurrency = useAtomValue(inputCurrencyAtom)
  const outputCurrency = useAtomValue(outputCurrencyAtom)

  const { data: selectedPool } = useAtomValue(selectedPoolAtom)
  const ticksData = useAtomValue(ticksAtom)

  const presetPercentMap = useAtomValue(presetPercentMapAtom)

  const currentMarketPrice = useAtomValue(currentMarketPriceAtom)

  return (
    <Card style={{ width: '100%' }}>
      <CardBody>
        <Text bold>Testing Area</Text>
        <Text>
          {inputCurrency?.symbol} &rarr; {outputCurrency?.symbol}
        </Text>
        <Text>{selectedPool?.poolId}</Text>
        <Text>{ticksData?.isSellingOrBuyingAtWorsePrice ? 'Bad Price ❌' : 'Good Price ✅'}</Text>
        <Text>
          <pre>
            {stringify(
              {
                tickLower: ticksData?.tickLower,
                tickUpper: ticksData?.tickUpper,
                tickCurrent: selectedPool?.pool?.tickCurrent,
                zeroForOne: ticksData?.zeroForOne,
                targetTick: ticksData?.targetTick,
                priceLower: ticksData?.priceLower.toSignificant(6),
                priceUpper: ticksData?.priceUpper.toSignificant(6),
                sqrtPriceFromTick: ticksData?.sqrtPrice.toFormat(6),
                currentMarketPrice,
              },
              null,
              2,
            )}
          </pre>
        </Text>

        <Text>{JSON.stringify(presetPercentMap, null, 2)}</Text>

        <TickVisualization ticksData={ticksData} selectedPool={selectedPool} />
      </CardBody>
    </Card>
  )
}
