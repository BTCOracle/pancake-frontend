import { CSSProperties } from 'react'

export enum Priority {
  FIRST_AD = 100,
  VERY_HIGH = 5,
  HIGH = 4,
  MEDIUM = 3,
  LOW = 2,
  VERY_LOW = 1,
}

export interface AdPlayerProps {
  isDismissible?: boolean

  /** Force mobile behavior.
   * For example,
   * 1) Expandable content opening in a Modal
   * 2) Placement of Close Button inside the card
   */
  forceMobile?: boolean
}

export interface AdSlide {
  id: string
  component: JSX.Element
  shouldRender?: Array<boolean>
  priority?: number
}

export interface AdTextConfig {
  text: string
  highlights?: string[]
  link?: string
  subTitle?: boolean
  inline?: boolean
}
export interface BtnConfig {
  text: string
  link: string
  mt?: string
}
export interface AdsConfig {
  img: string
  texts: AdTextConfig[]
  btn: BtnConfig
  options?: {
    imagePadding?: string
    imageMargin?: string
  }
}

export interface InfoStripeConfig {
  img: string
  texts: AdTextConfig[]
  btns: BtnConfig[]
}

export enum AdsConfigTypes {
  DEFAULT = 'default',
  PICKS = 'picks',
}

export interface AdsCampaignConfig {
  id: string
  ad: AdsConfig
  infoStripe?: InfoStripeConfig
  priority?: number
  start?: number
  end?: number
}

type Token = {
  address: string
  name: string
  symbol: string
  color: string
  img: string
}

export type PickConfig = {
  chain: string
  poolId: `0x{string}`
  token0: Token
  token1: Token
  url: string
}

export type PicksConfig = {
  update: number
  configs: PickConfig[]
}

export type I18nText =
  | string
  | {
      mobile: string
      desktop: string
    }

export type AdText =
  | string
  | {
      i18nText: I18nText
      highlight?: boolean
      link?: string
      style?: CSSProperties
    }

export interface RemoteAds {
  id: string
  imgUrl: string
  imgUrlMobile?: string
  priority: number
  texts: AdText[]
  actions: Array<{
    type: 'button'
    i18nText: I18nText
    link: string
    external?: boolean
    style?: CSSProperties
  }>
  startTime?: string
  endTime?: string
}
