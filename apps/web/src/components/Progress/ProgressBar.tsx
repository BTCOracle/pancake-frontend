import { Box, BoxProps, lightColors } from '@pancakeswap/uikit'
import { useMemo } from 'react'
import styled from 'styled-components'

type Color = keyof typeof lightColors | (string & Record<never, never>)

const ProgressBarContainer = styled(Box)<{ $backgroundColor: Color; $height: string }>`
  width: 100%;
  height: ${({ $height }) => $height};
  background-color: ${({ theme, $backgroundColor }) => theme.colors[$backgroundColor] || $backgroundColor};
  border-radius: 10px;
`

const ProgressBarFill = styled.div<{ progress: number; $fillColor: string; $height: string }>`
  width: ${({ progress }) => progress}%;
  height: ${({ $height }) => $height};
  background-color: ${({ theme, $fillColor }) => theme.colors[$fillColor] || $fillColor};
  border-radius: 10px;
`

interface ProgressBarProps extends BoxProps {
  min: number
  max: number
  progress: number
  backgroundColor?: Color
  fillColor?: Color
  height?: string
}

export const ProgressBar = ({
  min = 0,
  max = 100,
  progress = 0,
  backgroundColor = 'background',
  fillColor = 'primary',
  height = '10px',
  ...props
}: ProgressBarProps) => {
  const progressPercentage = useMemo(() => ((progress - min) / (max - min)) * 100, [progress, min, max])

  return (
    <ProgressBarContainer $backgroundColor={backgroundColor} $height={height} {...props}>
      <ProgressBarFill progress={progressPercentage} $fillColor={fillColor} $height={height} />
    </ProgressBarContainer>
  )
}
