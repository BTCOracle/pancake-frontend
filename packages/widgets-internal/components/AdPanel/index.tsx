import { DesktopCard } from "./DesktopCard";
import { MobileCard } from "./MobileCard";
import { AdPanelCardProps } from "./types";

export * from "./types";
export { Priority } from "./config";
export { useShowAdPanel } from "./hooks/useShowAdPanel";

export const AdPanel = (props: AdPanelCardProps) => (
  <>
    <MobileCard mt="4px" mb="12px" {...props} />
    <DesktopCard {...props} />
  </>
);
