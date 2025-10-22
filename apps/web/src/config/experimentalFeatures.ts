export enum EXPERIMENTAL_FEATURES {
  WebNotifications = 'web-notifications',
  SpeedQuote = 'routing-speed-quote',
  PriceAPI = 'price-api',
  PCSX = 'pcsx',
  OPTIMIZED_AMM_TRADE = 'optimized-amm-trade',
  BRIDGE_V2 = 'bridge-v2',
}

export const getCookieKey = (key: EXPERIMENTAL_FEATURES) => `p_exp_${key.toLowerCase()}`

export type FeatureRollOutConfig = {
  feature: EXPERIMENTAL_FEATURES
  percentage: number
  whitelist: string[]
}

export type ExperimentalFeatureConfigs = FeatureRollOutConfig[]

// Add new AB TESTS here as well as their config
export const EXPERIMENTAL_FEATURE_CONFIGS: ExperimentalFeatureConfigs = [
  {
    feature: EXPERIMENTAL_FEATURES.WebNotifications,
    percentage: 1,
    whitelist: [],
  },
  {
    feature: EXPERIMENTAL_FEATURES.SpeedQuote,
    percentage: 1,
    whitelist: [],
  },
  {
    feature: EXPERIMENTAL_FEATURES.PriceAPI,
    percentage: 0.5,
    whitelist: [],
  },
  {
    feature: EXPERIMENTAL_FEATURES.PCSX,
    percentage: 1,
    whitelist: [],
  },
  {
    feature: EXPERIMENTAL_FEATURES.OPTIMIZED_AMM_TRADE,
    percentage: 0.01,
    whitelist: [],
  },
  {
    feature: EXPERIMENTAL_FEATURES.BRIDGE_V2,
    percentage: 1,
    whitelist: [],
  },
]
