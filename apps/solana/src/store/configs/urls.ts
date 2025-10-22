import { API_URLS } from '@pancakeswap/solana-core-sdk'

export const urlConfigs = {
  ...API_URLS,
  BASE_HOST: process.env.NEXT_PUBLIC_EXPLORE_API_ENDPOINT ?? API_URLS.BASE_HOST,
  POOL_LIST: '/cached/v1/pools/info/list',
  MINT_PRICE: '/cached/v1/tokens/price',
  INFO: '/cached/v1/pools/stats/overview',
  POOL_SEARCH_BY_ID: '/cached/v1/pools/info/ids',
  POOL_POSITION_LINE: '/cached/v1/pools/line/position',
  POOL_LIQUIDITY_LINE: '/cached/v1/pools/line/liquidity',
  POOL_TVL_LINE: '/cached/v1/pools/line/tvl',
  POOL_KEY_BY_ID: '/cached/v1/pools/info/ids',
  BIRDEYE_TOKEN_PRICE: '/cached/v1/tokens/birdeye/defi/multi_price',
  TOKEN_LIST: 'https://api-v3.raydium.io/mint/list',
  PCS_TOKEN_LIST: 'https://tokens.pancakeswap.finance/pancakeswap-solana-default.json'
}
