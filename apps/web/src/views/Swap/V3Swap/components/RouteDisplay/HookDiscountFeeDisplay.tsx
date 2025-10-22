import { HOOK_CATEGORY } from '@pancakeswap/infinity-sdk'
import { useTranslation } from '@pancakeswap/localization'
import { FlexGap, Text, useMatchBreakpoints, useTooltip } from '@pancakeswap/uikit'
import { useMemo } from 'react'
import styled from 'styled-components'

const HookTip = styled(FlexGap)`
  cursor: pointer;
  border-radius: 8px;

  &:hover {
    background-color: ${({ theme }) => theme.colors.tertiary};
  }
`

const BrevisIcon = () => {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 17 17"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
    >
      <rect x="0.5" y="0.5" width="16" height="16" fill="url(#pattern0_4505_59569)" />
      <defs>
        <pattern id="pattern0_4505_59569" patternContentUnits="objectBoundingBox" width="1" height="1">
          <use xlinkHref="#image0_4505_59569" transform="scale(0.00625)" />
        </pattern>
        <image
          id="image0_4505_59569"
          width="160"
          height="160"
          preserveAspectRatio="none"
          xlinkHref="data:image/png;base64,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"
        />
      </defs>
    </svg>
  )
}

export const HookDiscountFeeDisplay: React.FC<{
  hookCategory?: HOOK_CATEGORY.BrevisDiscount | HOOK_CATEGORY.PrimusDiscount
  hookDiscount?: { originalFee: number; discountFee: number }
  feeDisplay: string
  originalFeeDisplay: string
  showIcon?: boolean
}> = ({ hookDiscount, hookCategory, feeDisplay, originalFeeDisplay, showIcon }) => {
  const { t } = useTranslation()
  const { isMobile } = useMatchBreakpoints()
  const noDiscount = hookDiscount?.discountFee === hookDiscount?.originalFee
  const noDiscountText = useMemo(() => {
    if (!hookCategory) return ''
    if (hookCategory === HOOK_CATEGORY.BrevisDiscount) {
      return t('You’re trading via Brevis Hook-enabled pool, check for discount eligibility on pool page.')
    }
    if (hookCategory === HOOK_CATEGORY.PrimusDiscount) {
      return t('You’re trading via Primus Hook-enabled pool, check for discount eligibility on pool page.')
    }
    return ''
  }, [hookCategory, t])
  const hasDiscountText = useMemo(() => {
    if (!hookCategory) return ''
    if (hookCategory === HOOK_CATEGORY.BrevisDiscount) {
      return t('You’ve qualified for a discount via a Brevis Hook-enabled pool!')
    }
    if (hookCategory === HOOK_CATEGORY.PrimusDiscount) {
      return t('You’ve qualified for a discount via a Primus Hook-enabled pool!')
    }
    return ''
  }, [hookCategory, t])
  const hookLabel = useMemo(() => {
    if (!hookCategory) return ''
    if (hookCategory === HOOK_CATEGORY.BrevisDiscount) {
      return 'Fee Discount (Brevis)'
    }
    if (hookCategory === HOOK_CATEGORY.PrimusDiscount) {
      return 'Fee Discount (Primus)'
    }
    return ''
  }, [hookCategory])

  const { targetRef, tooltip, tooltipVisible } = useTooltip(
    <Text>{noDiscount ? noDiscountText : hasDiscountText}</Text>,
  )

  return (
    <>
      {tooltipVisible && tooltip}
      {isMobile ? (
        <FlexGap gap="4px" ref={targetRef} style={{ textDecoration: 'underline dotted', cursor: 'pointer' }}>
          <Text color={!noDiscount ? 'positive60' : undefined} bold>
            ({feeDisplay}%)
          </Text>
          {!noDiscount ? <Text strikeThrough>({originalFeeDisplay}%)</Text> : null}
        </FlexGap>
      ) : (
        <>
          <FlexGap gap="4px" ref={targetRef}>
            <Text fontSize={14} color={!noDiscount ? 'positive60' : undefined} bold>
              ({feeDisplay}%)
            </Text>
            {!noDiscount ? (
              <Text fontSize={14} strikeThrough>
                ({originalFeeDisplay}%)
              </Text>
            ) : null}
          </FlexGap>
          <HookTip flexDirection="row" alignItems="center" gap="4px" ref={targetRef}>
            {showIcon && hookCategory === HOOK_CATEGORY.BrevisDiscount ? <BrevisIcon /> : null}
            <Text fontSize={12} lineHeight={1} color="secondaryText">
              {hookLabel}
            </Text>
          </HookTip>
        </>
      )}
    </>
  )
}
