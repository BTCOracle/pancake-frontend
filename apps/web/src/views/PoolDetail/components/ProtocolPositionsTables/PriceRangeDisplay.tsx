import { Flex, FlexGap, Text } from '@pancakeswap/uikit'
import { formatNumber } from '@pancakeswap/utils/formatNumber'
import styled from 'styled-components'

const PriceRangeContainer = styled.div<{ $maxWidth?: string }>`
  position: relative;
  width: ${({ $maxWidth }) => $maxWidth ?? '180px'};
  height: 20px;
  display: flex;
  align-items: center;
`

const PriceRangeBar = styled.div<{ outOfRange: boolean; disabled?: boolean }>`
  width: 100%;
  height: 6px;
  background: ${({ theme, outOfRange, disabled }) =>
    disabled ? theme.colors.disabled : outOfRange ? theme.colors.failure : theme.colors.success};
  border-radius: 4px;
  position: relative;
`

const ExtendedPriceRangeBar = styled.div`
  width: 100%;
  height: 6px;
  border-radius: 4px;
  position: relative;
  display: flex;
`

const BarSegment = styled.div<{
  width: number
  isGray?: boolean
  outOfRange?: boolean
  disabled?: boolean
}>`
  height: 100%;
  background: ${({ theme, isGray, outOfRange, disabled }) => {
    if (disabled) return theme.colors.disabled
    if (isGray) return theme.colors.tertiary // More visible gray color
    return outOfRange ? theme.colors.failure : theme.colors.success
  }};
  ${({ width }) => `width: ${width}%;`}

  &:first-child {
    border-radius: 4px 0 0 4px;
  }

  &:last-child {
    border-radius: 0 4px 4px 0;
  }

  &:only-child {
    border-radius: 4px;
  }
`

const CurrentPriceLine = styled.div<{
  position: number
  outOfRange: boolean
  disabled?: boolean
  isOverflow?: boolean
}>`
  position: absolute;
  left: ${({ position }) => Math.max(0, Math.min(100, position))}%;
  top: -5px;
  transform: translateX(-50%);
  width: 4px;
  height: 16px;
  background: ${({ theme, outOfRange, disabled, isOverflow }) =>
    disabled
      ? theme.colors.disabled
      : isOverflow
      ? theme.colors.tertiary
      : outOfRange
      ? theme.colors.failure
      : theme.colors.success};
  border-radius: 3px;
  z-index: 2;
`

const RangeMarker = styled.div<{ position: number; disabled?: boolean }>`
  position: absolute;
  left: ${({ position }) => Math.max(0, Math.min(100, position))}%;
  top: -5px;
  transform: translateX(-50%);
  width: 4px;
  height: 16px;
  background: ${({ theme, disabled }) => (disabled ? theme.colors.disabled : theme.colors.failure)};
  border-radius: 3px;
  z-index: 2;
`

const PercentageText = styled(Text)<{ isNegative?: boolean }>`
  color: ${({ theme }) => theme.colors.textSubtle};
  font-size: 12px;
  font-weight: 400;
`

const PercentageContainer = styled.div<{
  leftPosition: number
  rightPosition: number
  $maxWidth?: string
}>`
  position: relative;
  width: 100%;
  max-width: ${({ $maxWidth }) => $maxWidth};
  height: 16px;
  margin-bottom: 4px;
  margin-left: auto;
  margin-right: auto;

  .left-percentage {
    position: absolute;
    left: ${({ leftPosition }) => leftPosition}%;
    transform: translateX(-50%);
  }

  .right-percentage {
    position: absolute;
    left: ${({ rightPosition }) => rightPosition}%;
    transform: translateX(-50%);
  }
`

const PriceContainer = styled.div<{ leftPosition: number; rightPosition: number; $maxWidth?: string }>`
  position: relative;
  width: 100%;
  max-width: ${({ $maxWidth }) => $maxWidth};
  height: 24px;
  margin-bottom: 2px;
  margin-left: auto;
  margin-right: auto;

  .left-price {
    position: absolute;
    left: ${({ leftPosition }) => leftPosition}%;
    transform: translateX(-40%);
  }

  .right-price {
    position: absolute;
    left: ${({ rightPosition }) => rightPosition}%;
    transform: translateX(-50%);
  }
`

interface PriceRangeDisplayProps {
  minPrice: string
  maxPrice: string
  currentPrice?: string
  minPercentage?: string
  maxPercentage?: string
  rangePosition?: number
  outOfRange?: boolean
  removed?: boolean
  showPercentages?: boolean
  maxWidth?: string
}

export const PriceRangeDisplay: React.FC<PriceRangeDisplayProps> = ({
  minPrice,
  maxPrice,
  currentPrice,
  minPercentage,
  maxPercentage,
  rangePosition = 50,
  outOfRange = false,
  removed = false,
  showPercentages = true,
  maxWidth = '190px',
}) => {
  // Convert prices to numbers for comparison
  const currentPriceNum = currentPrice ? parseFloat(currentPrice) : null
  const minPriceNum = parseFloat(minPrice)
  const maxPriceNum = parseFloat(maxPrice)

  // Validate price range
  if (minPriceNum >= maxPriceNum) {
    console.warn('Invalid price range: minPrice should be less than maxPrice')
  }

  // Check if current price is out of range
  const isOverflowLeft = currentPriceNum !== null && currentPriceNum < minPriceNum
  const isOverflowRight = currentPriceNum !== null && currentPriceNum > maxPriceNum
  const hasOverflow = outOfRange && (isOverflowLeft || isOverflowRight)

  // Calculate display values and positions
  const displayMinPrice =
    minPrice !== '0'
      ? formatNumber(
          minPrice,
          Number(minPrice) < 1 ? { maximumDecimalTrailingZeroes: 4 } : { maxDecimalDisplayDigits: 4 },
        )
      : '0'
  const displayMaxPrice =
    maxPrice !== '∞'
      ? formatNumber(
          maxPrice,
          Number(maxPrice) < 1 ? { maximumDecimalTrailingZeroes: 4 } : { maxDecimalDisplayDigits: 4 },
        )
      : '∞'

  let currentPriceLinePosition = rangePosition
  let percentageLeftPosition = 0
  let percentageRightPosition = 100

  // Accommodate longer numbers
  const EXTRA_DISTANCE = Math.min(
    displayMinPrice.length + displayMaxPrice.length > 12 ? displayMinPrice.length + displayMaxPrice.length : 0,
    40, // Max extra distance 40%
  )

  // Minimum distance between text positions (in percentage)
  const MIN_TEXT_DISTANCE = 35 + EXTRA_DISTANCE

  // Minimum width for the main range (colored segment) in percentage
  const MIN_RANGE_WIDTH = 35 + EXTRA_DISTANCE

  if (hasOverflow && currentPriceNum !== null) {
    if (isOverflowLeft) {
      const totalRange = maxPriceNum - currentPriceNum
      const graySegmentWidth = ((minPriceNum - currentPriceNum) / totalRange) * 100

      currentPriceLinePosition = 0

      // Calculate ideal positions
      let idealLeftPosition = graySegmentWidth
      let idealRightPosition = 100

      // Enforce minimum distance
      const currentDistance = idealRightPosition - idealLeftPosition
      if (currentDistance < MIN_TEXT_DISTANCE) {
        // Expand the range to maintain minimum distance
        const expansion = (MIN_TEXT_DISTANCE - currentDistance) / 2
        idealLeftPosition = Math.max(0, idealLeftPosition - expansion)
        idealRightPosition = Math.min(100, idealRightPosition + expansion)

        // If we can't expand both sides equally, prioritize the side that can expand more
        if (idealLeftPosition === 0) {
          idealRightPosition = Math.min(100, idealLeftPosition + MIN_TEXT_DISTANCE)
        } else if (idealRightPosition === 100) {
          idealLeftPosition = Math.max(0, idealRightPosition - MIN_TEXT_DISTANCE)
        }
      }

      percentageLeftPosition = idealLeftPosition
      percentageRightPosition = idealRightPosition
    }

    if (isOverflowRight) {
      const totalRange = currentPriceNum - minPriceNum
      const coloredSegmentWidth = ((maxPriceNum - minPriceNum) / totalRange) * 100

      currentPriceLinePosition = 100

      // Calculate ideal positions
      let idealLeftPosition = 0
      let idealRightPosition = coloredSegmentWidth

      // Enforce minimum distance
      const currentDistance = idealRightPosition - idealLeftPosition
      if (currentDistance < MIN_TEXT_DISTANCE) {
        // Expand the range to maintain minimum distance
        const expansion = (MIN_TEXT_DISTANCE - currentDistance) / 2
        idealLeftPosition = Math.max(0, idealLeftPosition - expansion)
        idealRightPosition = Math.min(100, idealRightPosition + expansion)

        // If we can't expand both sides equally, prioritize the side that can expand more
        if (idealLeftPosition === 0) {
          idealRightPosition = Math.min(100, idealLeftPosition + MIN_TEXT_DISTANCE)
        } else if (idealRightPosition === 100) {
          idealLeftPosition = Math.max(0, idealRightPosition - MIN_TEXT_DISTANCE)
        }
      }

      percentageLeftPosition = idealLeftPosition
      percentageRightPosition = idealRightPosition
    }
  }

  const renderBar = () => {
    if (!hasOverflow) {
      // Original behavior - single colored bar
      return (
        <PriceRangeBar outOfRange={outOfRange} disabled={removed}>
          <CurrentPriceLine position={currentPriceLinePosition} outOfRange={outOfRange} disabled={removed} />
        </PriceRangeBar>
      )
    }

    // Extended bar with segments
    if (isOverflowLeft) {
      const totalRange = maxPriceNum - currentPriceNum!
      let graySegmentWidth = ((minPriceNum - currentPriceNum!) / totalRange) * 100
      let coloredSegmentWidth = ((maxPriceNum - minPriceNum) / totalRange) * 100

      // Enforce minimum width for colored segment
      if (coloredSegmentWidth < MIN_RANGE_WIDTH) {
        coloredSegmentWidth = MIN_RANGE_WIDTH
        graySegmentWidth = 100 - coloredSegmentWidth
      }

      return (
        <ExtendedPriceRangeBar>
          <BarSegment width={graySegmentWidth} isGray disabled={removed} />
          <BarSegment width={coloredSegmentWidth} outOfRange={outOfRange} disabled={removed} />
          <CurrentPriceLine
            position={currentPriceLinePosition}
            outOfRange={outOfRange}
            disabled={removed}
            isOverflow={hasOverflow}
          />
          {/* Range markers at the edges of the main range */}
          <RangeMarker position={graySegmentWidth} disabled={removed} />
          <RangeMarker position={100} disabled={removed} />
        </ExtendedPriceRangeBar>
      )
    }

    if (isOverflowRight) {
      const totalRange = currentPriceNum! - minPriceNum
      let coloredSegmentWidth = ((maxPriceNum - minPriceNum) / totalRange) * 100
      let graySegmentWidth = ((currentPriceNum! - maxPriceNum) / totalRange) * 100

      // Enforce minimum width for colored segment
      if (coloredSegmentWidth < MIN_RANGE_WIDTH) {
        coloredSegmentWidth = MIN_RANGE_WIDTH
        graySegmentWidth = 100 - coloredSegmentWidth
      }

      return (
        <ExtendedPriceRangeBar>
          <BarSegment width={coloredSegmentWidth} outOfRange={outOfRange} disabled={removed} />
          <BarSegment width={graySegmentWidth} isGray disabled={removed} />
          <CurrentPriceLine
            position={currentPriceLinePosition}
            outOfRange={outOfRange}
            disabled={removed}
            isOverflow={hasOverflow}
          />
          {/* Range markers at the edges of the main range */}
          <RangeMarker position={0} disabled={removed} />
          <RangeMarker position={coloredSegmentWidth} disabled={removed} />
        </ExtendedPriceRangeBar>
      )
    }

    return null
  }

  const renderPercentages = () => {
    if (!showPercentages) return null

    if (!hasOverflow) {
      // Original behavior - percentages at the edges
      return (
        <FlexGap alignItems="center" justifyContent="space-between" width="100%" maxWidth={maxWidth} mb="4px">
          <PercentageText>{minPercentage}</PercentageText>
          <PercentageText>{maxPercentage}</PercentageText>
        </FlexGap>
      )
    }

    // For overflow cases, position percentages under the actual position range
    return (
      <PercentageContainer
        leftPosition={percentageLeftPosition}
        rightPosition={percentageRightPosition}
        $maxWidth={maxWidth}
      >
        <div className="left-percentage">
          <PercentageText>{minPercentage}</PercentageText>
        </div>
        <div className="right-percentage">
          <PercentageText>{maxPercentage}</PercentageText>
        </div>
      </PercentageContainer>
    )
  }

  const renderPrices = () => {
    if (!hasOverflow) {
      // Original behavior - prices at the edges with dash
      return (
        <FlexGap alignItems="center" gap="8px" mb="2px" width="100%" maxWidth={maxWidth}>
          <Flex alignItems="center" justifyContent="space-between" width="100%">
            <Text fontSize="16px" bold>
              {displayMinPrice}
            </Text>
            <Text fontSize="16px" bold>
              -
            </Text>
            <Text fontSize="16px" bold>
              {displayMaxPrice}
            </Text>
          </Flex>
        </FlexGap>
      )
    }

    // For overflow cases, position prices at the actual position range
    return (
      <PriceContainer
        leftPosition={percentageLeftPosition}
        rightPosition={percentageRightPosition}
        $maxWidth={maxWidth}
      >
        <div className="left-price">
          <Text fontSize="16px" bold>
            {displayMinPrice}
          </Text>
        </div>
        <div className="right-price">
          <Text fontSize="16px" bold>
            {displayMaxPrice}
          </Text>
        </div>
      </PriceContainer>
    )
  }

  return (
    <Flex flexDirection="column" alignItems="flex-start" width="100%">
      {/* Price range display */}
      {renderPrices()}

      {/* Price range bar */}
      {showPercentages && (
        <Flex width="100%" maxWidth={maxWidth} justifyContent="center" mb="4px" ml="auto" mr="auto">
          <PriceRangeContainer $maxWidth={maxWidth}>{renderBar()}</PriceRangeContainer>
        </Flex>
      )}

      {/* Percentage display below the range bar */}
      {renderPercentages()}
    </Flex>
  )
}
