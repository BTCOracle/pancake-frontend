import { AtomBox, Flex, useTooltip } from '@pancakeswap/uikit'
import { CurrencyLogo } from '@pancakeswap/widgets-internal'

import { RouterPoolBox, RouterTypeText } from 'views/Swap/components/RouterViewer'
import { Pair } from './RouteDisplay/types'

export function PairNode({
  pair,
  text,
  className,
  tooltipText,
}: {
  pair: Pair
  text: string | React.ReactNode
  className: string
  tooltipText: string
}) {
  const [input, output] = pair

  const tooltip = useTooltip(tooltipText)

  return (
    <RouterPoolBox className={className}>
      {tooltip.tooltipVisible && tooltip.tooltip}
      <Flex ref={tooltip.targetRef}>
        <AtomBox
          size={{
            xs: '24px',
            md: '32px',
          }}
        >
          <CurrencyLogo size="100%" currency={input} />
        </AtomBox>
        <AtomBox
          size={{
            xs: '24px',
            md: '32px',
          }}
        >
          <CurrencyLogo size="100%" currency={output} />
        </AtomBox>
      </Flex>
      <RouterTypeText>{text}</RouterTypeText>
    </RouterPoolBox>
  )
}
