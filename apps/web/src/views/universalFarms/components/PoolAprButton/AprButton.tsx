import { FlexGap, Skeleton, Text, TextProps, TooltipText } from '@pancakeswap/uikit'
import { displayApr } from '@pancakeswap/utils/displayApr'
import { FarmWidget } from '@pancakeswap/widgets-internal'
import { forwardRef, MouseEvent, useCallback, useMemo } from 'react'

type ApyButtonProps = {
  showApyButton?: boolean
  loading?: boolean
  onClick?: () => void
  hasFarm?: boolean
  onAPRTextClick?: () => void
  baseApr?: number
  textProps?: TextProps
}

export const AprButton = forwardRef<HTMLElement, ApyButtonProps>(
  ({ showApyButton = true, loading, onClick, onAPRTextClick, baseApr, hasFarm, textProps }, ref) => {
    const handleClick = useCallback(
      (e: MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (onClick) {
          onClick()
        }
      },
      [onClick],
    )

    if (loading) {
      return <Skeleton height={24} width={80} style={{ borderRadius: '12px' }} />
    }

    return (
      <FlexGap alignItems="center">
        {showApyButton && <FarmWidget.FarmApyButton variant="text-and-button" handleClickButton={handleClick} />}
        <AprButtonText hasFarm={hasFarm} baseApr={baseApr} ref={ref} onClick={onAPRTextClick} textProps={textProps} />
      </FlexGap>
    )
  },
)

type AprButtonTextProps = Pick<ApyButtonProps, 'baseApr' | 'hasFarm' | 'textProps'> & {
  onClick?: () => void
}

const AprButtonText = forwardRef<HTMLElement, AprButtonTextProps>(
  ({ baseApr, hasFarm, onClick, textProps = { fontSize: '16px' } }, ref) => {
    const isZeroApr = baseApr === 0

    const ZeroApr = useMemo(
      () => (
        <TooltipText ml="4px" bold {...textProps} color="destructive">
          0%
        </TooltipText>
      ),
      [],
    )

    const commonApr = useMemo(
      () => (
        <FlexGap>
          {hasFarm ? (
            <Text color="v2Primary50" bold {...textProps}>
              🌿
            </Text>
          ) : null}
          <TooltipText ml="4px" color="text" {...textProps}>
            {baseApr ? displayApr(baseApr) : null}
          </TooltipText>
        </FlexGap>
      ),
      [baseApr, hasFarm],
    )

    if (typeof baseApr === 'undefined') {
      return null
    }
    return (
      <span ref={ref} onClick={onClick} aria-hidden>
        {isZeroApr ? ZeroApr : commonApr}
      </span>
    )
  },
)
