import { useIsMounted } from "@pancakeswap/hooks";
import { useMatchBreakpoints } from "../../../contexts";
import { TOP_BANNER_HEIGHT, TOP_BANNER_HEIGHT_MOBILE } from "../../Menu/config";
import { TopBannerContainer } from "../../Menu/styled";

export type AnnouncementBannerProps = React.PropsWithChildren;

export const AnnouncementBanner: React.FC<AnnouncementBannerProps> = ({ children }) => {
  const isMounted = useIsMounted();
  const { isMobile } = useMatchBreakpoints();
  const topBannerHeight = isMobile ? TOP_BANNER_HEIGHT_MOBILE : TOP_BANNER_HEIGHT;

  if (!isMounted || !children) {
    return null;
  }

  return <TopBannerContainer height={topBannerHeight}>{children}</TopBannerContainer>;
};
