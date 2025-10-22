import { BoxProps, useMatchBreakpoints } from '@pancakeswap/uikit'
import { AdPlayer } from './AdPlayer'
import { StaticContainer } from './StaticContainer'
import { AdPlayerProps } from './ads.types'
import { useShowAdPanel } from './useShowAdPanel'

interface MobileCardProps extends BoxProps, AdPlayerProps {
  shouldRender?: boolean
}
/**
 * Renders Ad banners on mobile and tablet
 */
export const MobileCard = ({
  shouldRender = true,
  isDismissible = true,
  forceMobile = false,
  ...props
}: MobileCardProps) => {
  const { isDesktop } = useMatchBreakpoints()
  const [show] = useShowAdPanel()

  return shouldRender && !isDesktop && show ? (
    <StaticContainer {...props}>
      <AdPlayer isDismissible={isDismissible} forceMobile={forceMobile} />
    </StaticContainer>
  ) : null
}
