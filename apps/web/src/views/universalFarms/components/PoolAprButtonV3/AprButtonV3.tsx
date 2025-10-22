import { FlexGap, Skeleton, Text, TooltipText } from '@pancakeswap/uikit'
import { displayApr } from '@pancakeswap/utils/displayApr'
import { FarmWidget } from '@pancakeswap/widgets-internal'
import { forwardRef, MouseEvent, useCallback, useMemo } from 'react'

type ApyButtonProps = {
  showApyButton?: boolean
  showApyText?: boolean
  loading?: boolean
  onClick?: () => void
  hasFarm?: boolean
  onAPRTextClick?: () => void
  baseApr?: number
  fontSize?: string
  color?: string
}

export const AprButtonV3 = forwardRef<HTMLElement, ApyButtonProps>(
  (
    {
      showApyButton = true,
      showApyText = true,
      loading,
      onClick,
      onAPRTextClick,
      baseApr,
      hasFarm,
      fontSize = '28px',
      color,
    },
    ref,
  ) => {
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
        {showApyText && (
          <AprButtonText
            hasFarm={hasFarm}
            baseApr={baseApr}
            fontSize={fontSize}
            ref={ref}
            onClick={onAPRTextClick}
            color={color}
          />
        )}
      </FlexGap>
    )
  },
)

type AprButtonTextProps = Pick<ApyButtonProps, 'baseApr' | 'hasFarm' | 'fontSize'> & {
  onClick?: () => void
  color?: string
}

const AprButtonText = forwardRef<HTMLElement, AprButtonTextProps>(
  ({ baseApr, hasFarm, fontSize = '28px', onClick, color }, ref) => {
    const isZeroApr = baseApr === 0

    const ZeroApr = useMemo(
      () => (
        <TooltipText ml="4px" fontSize={fontSize} color="destructive" bold>
          0%
        </TooltipText>
      ),
      [fontSize],
    )

    const commonApr = useMemo(
      () => (
        <FlexGap>
          {hasFarm ? (
            <Text fontSize={fontSize} color={color} bold>
              🌿
            </Text>
          ) : null}
          <TooltipText ml="4px" fontSize={fontSize} color={color} bold>
            {baseApr ? displayApr(baseApr) : null}
          </TooltipText>
        </FlexGap>
      ),
      [baseApr, hasFarm, fontSize, color],
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
