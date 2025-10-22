import { AutoColumn, Row, useMatchBreakpoints } from '@pancakeswap/uikit'
import { SwapUIV2 } from '@pancakeswap/widgets-internal'
import { LottieRefCurrentProps } from 'lottie-react'
import dynamic from 'next/dynamic'
import { CSSProperties, memo, useCallback, useMemo, useRef } from 'react'
import styled, { keyframes } from 'styled-components'
import { useColorMode } from '@chakra-ui/react'
import { colors } from '@/theme/cssVariables'
import ArrowDark from '../../../../public/images/swap/arrow_dark.json' assert { type: 'json' }
import ArrowLight from '../../../../public/images/swap/arrow_light.json' assert { type: 'json' }

const Lottie = dynamic(() => import('lottie-react'), { ssr: false })

export const Line = styled.div`
  position: absolute;
  left: -16px;
  right: -16px;
  height: 1px;
  background-color: ${colors.cardBorder01};
  top: calc(50% + 6px);
`

export const FlipButton = memo(function FlipButton({
  compact,
  replaceBrowser = true,
  onClick
}: {
  compact?: boolean
  replaceBrowser?: boolean
  onClick?: () => void
}) {
  const flipButtonRef = useRef<HTMLDivElement>(null)
  const lottieRef = useRef<LottieRefCurrentProps | null>(null)
  const { colorMode } = useColorMode()
  const isDark = colorMode === 'dark'
  const { isDesktop } = useMatchBreakpoints()

  const animationData = useMemo(() => (isDark ? ArrowDark : ArrowLight), [isDark])

  const handleAnimatedButtonClick = useCallback(() => {
    onClick?.()

    if (flipButtonRef.current && !flipButtonRef.current.classList.contains('switch-animation')) {
      flipButtonRef.current.classList.add('switch-animation')
    }
  }, [onClick])

  const handleAnimationEnd = useCallback(() => {
    flipButtonRef.current?.classList.remove('switch-animation')
  }, [])

  return (
    <AutoColumn
      justify="space-between"
      position="relative"
      style={{
        ...getCompactWrapperStyle(compact)
      }}
    >
      {!compact && <Line />}
      <AutoRow
        justify="center"
        style={{
          padding: '0 1rem',
          marginTop: '1em',
          ...getCompactStyle(compact)
        }}
      >
        {isDesktop ? (
          <FlipButtonWrapper ref={flipButtonRef} onAnimationEnd={handleAnimationEnd}>
            <Lottie
              lottieRef={lottieRef}
              animationData={animationData}
              style={{ height: '40px', cursor: 'pointer' }}
              onClick={handleAnimatedButtonClick}
              autoplay={false}
              loop={false}
              onMouseEnter={() => lottieRef.current?.playSegments([7, 19], true)}
              onMouseLeave={() => {
                handleAnimationEnd()
                lottieRef.current?.playSegments([39, 54], true)
              }}
            />
          </FlipButtonWrapper>
        ) : (
          <SwapUIV2.SwitchButtonV2 onClick={onClick} />
        )}
      </AutoRow>
    </AutoColumn>
  )
})

const getCompactWrapperStyle = (compact?: boolean): CSSProperties => {
  if (compact) {
    return {
      position: 'relative',
      height: 0,
      padding: 0,
      margin: 0
    }
  }
  return {}
}
const getCompactStyle = (compact?: boolean): CSSProperties => {
  if (compact) {
    return {
      position: 'absolute',
      zIndex: 2,
      top: 0,
      marginTop: 0,
      padding: 0,
      left: '50%',
      transform: 'translate(-50%, -50%)'
    }
  }
  return {}
}

const switchAnimation = keyframes`
  from {transform: rotate(0deg);}
  to {transform: rotate(180deg);}
`

const FlipButtonWrapper = styled.div`
  will-change: transform;
  &.switch-animation {
    animation: ${switchAnimation} 0.25s forwards ease-in-out;
  }
`

const AutoRow = styled(Row)<{ gap?: string; justify?: string }>`
  flex-wrap: wrap;
  margin: ${({ gap }) => gap && `-${gap}`};
  justify-content: ${({ justify }) => justify} !important;

  & > * {
    margin: ${({ gap }) => gap} !important;
  }
`
