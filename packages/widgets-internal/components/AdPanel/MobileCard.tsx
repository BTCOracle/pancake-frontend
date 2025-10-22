import { useMatchBreakpoints } from "@pancakeswap/uikit";
import { AdPlayer } from "./AdPlayer";
import { StaticContainer } from "./StaticContainer";
import { AdPanelCardProps } from "./types";
import { useShowAdPanel } from "./hooks/useShowAdPanel";

/**
 * Renders Ad banners on mobile and tablet
 */
export const MobileCard = ({
  shouldRender = true,
  isDismissible = true,
  forceMobile = false,
  ...props
}: AdPanelCardProps) => {
  const { isDesktop } = useMatchBreakpoints();
  const [show] = useShowAdPanel();

  return shouldRender && !isDesktop && show ? (
    <StaticContainer {...props}>
      <AdPlayer config={props.config} isDismissible={isDismissible} forceMobile={forceMobile} />
    </StaticContainer>
  ) : null;
};
