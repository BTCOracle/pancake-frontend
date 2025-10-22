import React, { useMemo } from 'react'
import styled from 'styled-components'
import { Percent } from '@pancakeswap/swap-sdk-core'

interface PriceRangeBarProps {
  priceLowerDiffPercent?: Percent
  priceUpperDiffPercent?: Percent
}

const Container = styled.div`
  position: relative;
  width: 100%;
  height: 20px;
  display: flex;
  align-items: center;
`

const Track = styled.div`
  position: relative;
  width: 100%;
  height: 6px;
  background: ${({ theme }) => theme.colors.disabled};
  border-radius: 3px;
  border: 1px solid ${({ theme }) => theme.colors.inputSecondary};
`

const FilledTrack = styled.div<{
  width: number
  left: number
  isInRange: boolean
}>`
  position: absolute;
  left: ${({ left }) => left}%;
  top: 0;
  height: 100%;
  width: ${({ width }) => width}%;
  background: ${({ theme, isInRange }) => (isInRange ? theme.colors.success : theme.colors.failure)};
  border-radius: 3px;
  transition: all 0.2s ease;
`

const Thumb = styled.div<{
  position: number
  isInRange: boolean
}>`
  position: absolute;
  left: ${({ position }) => position}%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 6px;
  height: 12px;
  background: ${({ theme, isInRange }) => (isInRange ? theme.colors.success : theme.colors.failure)};
  border-radius: 16px;
  transition: all 0.2s ease;
  z-index: 2;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`

export const PriceRangeBar: React.FC<PriceRangeBarProps> = ({ priceLowerDiffPercent, priceUpperDiffPercent }) => {
  const hasValidData = priceLowerDiffPercent !== undefined && priceUpperDiffPercent !== undefined

  const isInRange = useMemo(() => {
    if (!hasValidData) return false

    const lowerPercent = priceLowerDiffPercent!.toFixed(2)
    const upperPercent = priceUpperDiffPercent!.toFixed(2)

    return parseFloat(lowerPercent) < 0 && parseFloat(upperPercent) > 0
  }, [priceLowerDiffPercent, priceUpperDiffPercent, hasValidData])

  const { thumbPosition, filledWidth, fillStart } = useMemo(() => {
    if (!hasValidData) {
      return {
        thumbPosition: 100,
        filledWidth: 0,
        fillStart: 0,
      }
    }

    const lowerPercent = parseFloat(priceLowerDiffPercent.toFixed(2))
    const upperPercent = parseFloat(priceUpperDiffPercent.toFixed(2))

    const lowerPosition = 100 + lowerPercent
    const upperPosition = 100 + upperPercent

    const thumbPos = 100

    return {
      thumbPosition: thumbPos / 2,
      filledWidth: Math.abs(upperPosition - lowerPosition) / 2,
      fillStart: Math.min(lowerPosition, upperPosition) / 2,
    }
  }, [priceLowerDiffPercent, priceUpperDiffPercent, hasValidData])

  return (
    <Container>
      <Track>
        {hasValidData && <FilledTrack width={filledWidth} left={fillStart} isInRange={isInRange} />}
        {hasValidData && <Thumb position={thumbPosition} isInRange={isInRange} />}
      </Track>
    </Container>
  )
}
