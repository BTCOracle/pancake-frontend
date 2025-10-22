import { DefaultSeoProps } from 'next-seo'
import { ASSET_CDN } from '@/utils/config/endpoint'

export const SEO: DefaultSeoProps = {
  titleTemplate: '%s | PancakeSwap',
  defaultTitle: 'PancakeSwap',
  description: 'Trade, earn, and own crypto on the all-in-one multichain DEX',
  twitter: {
    cardType: 'summary_large_image',
    handle: '@PancakeSwap',
    site: '@PancakeSwap'
  },
  openGraph: {
    title: "🥞 PancakeSwap - Everyone's Favorite DEX",
    description: 'Trade, earn, and own crypto on the all-in-one multichain DEX',
    images: [{ url: `${ASSET_CDN}/web/og/v2/hero.jpg` }]
  }
}
