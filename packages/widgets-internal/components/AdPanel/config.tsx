import { useMatchBreakpoints } from "@pancakeswap/uikit";
import { useMemo } from "react";
import { AdSlide } from "./types";

export enum Priority {
  FIRST_AD = 6,
  VERY_HIGH = 5,
  HIGH = 4,
  MEDIUM = 3,
  LOW = 2,
  VERY_LOW = 1,
}

export const useAdConfig = (adList: AdSlide[]) => {
  const { isDesktop } = useMatchBreakpoints();
  const MAX_ADS = isDesktop ? 6 : 4;
  return useMemo(
    () =>
      adList
        .filter((ad) => ad.shouldRender === undefined || ad.shouldRender.every(Boolean))
        .sort((a, b) => (b.priority || Priority.VERY_LOW) - (a.priority || Priority.VERY_LOW))
        .slice(0, MAX_ADS),
    [adList, MAX_ADS]
  );
};
