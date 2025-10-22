import { Box, useMatchBreakpoints } from '@pancakeswap/uikit'
import { useAtomValue } from 'jotai'
import styled from 'styled-components'
import { swapDetailsCollapseAtom, chartDisplayAtom } from 'views/SwapSimplify/InfinitySwap/atoms'
import { AdPlayer } from './AdPlayer'
import { AdPlayerProps } from './ads.types'
import { useShowAdPanel } from './useShowAdPanel'

interface DesktopCardProps extends AdPlayerProps {
  shouldRender?: boolean
}
/**
 * Renders floating Ad banners on desktop
 */
export const DesktopCard = ({
  shouldRender = true,
  isDismissible = true,
  forceMobile = false,
  ...props
}: DesktopCardProps) => {
  const { isDesktop } = useMatchBreakpoints()
  const [show] = useShowAdPanel()
  const isChartDisplayed = useAtomValue(chartDisplayAtom)
  const isSwapDetailsOpen = useAtomValue(swapDetailsCollapseAtom)

  // Apply left class when chart is displayed and swap details are open
  const shouldApplyLeftClass = isChartDisplayed && isSwapDetailsOpen

  return shouldRender && isDesktop && show ? (
    <FloatingContainer className={shouldApplyLeftClass ? 'left' : ''}>
      <AdPlayer isDismissible={isDismissible} forceMobile={forceMobile} {...props} />
    </FloatingContainer>
  ) : null
}

const FloatingContainer = styled(Box)`
  position: absolute;
  right: 30px;
  bottom: 30px;
  z-index: 10000;
  &.left {
    right: auto;
    left: 30px;
  }
`
