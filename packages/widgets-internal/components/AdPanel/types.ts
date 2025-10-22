import { BoxProps } from "@pancakeswap/uikit";

export interface AdSlide {
  id: string;
  component: JSX.Element;
  shouldRender?: Array<boolean>;
  priority?: number;
}

export interface AdPlayerProps {
  config: {
    commonLayoutWhitelistedPages: string[];
    adList: AdSlide[];
  };
  isDismissible?: boolean;

  /** Force mobile behavior.
   * For example,
   * 1) Expandable content opening in a Modal
   * 2) Placement of Close Button inside the card
   */
  forceMobile?: boolean;
}

export interface AdPanelCardProps extends BoxProps, AdPlayerProps {
  shouldRender?: boolean;
}

export interface AdTextConfig {
  text: string;
  highlights?: string[];
  link?: string;
  subTitle?: boolean;
}
export interface BtnConfig {
  text: string;
  link: string;
}
export interface AdsConfig {
  img: string;
  texts: AdTextConfig[];
  btn: BtnConfig;
  options?: {
    imagePadding?: string;
  };
}

export interface InfoStripeConfig {
  img: string;
  texts: AdTextConfig[];
  btns: BtnConfig[];
}

export enum AdsConfigTypes {
  DEFAULT = "default",
  PICKS = "picks",
}

export interface AdsCampaignConfig {
  id: string;
  ad: AdsConfig;
  infoStripe: InfoStripeConfig;
}

type Token = {
  address: string;
  name: string;
  symbol: string;
  color: string;
  img: string;
};

export type PickConfig = {
  chain: string;
  poolId: `0x{string}`;
  token0: Token;
  token1: Token;
};

export type PicksConfig = {
  update: number;
  configs: PickConfig[];
};
