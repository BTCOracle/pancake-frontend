import memoize from 'lodash/memoize'
import { ASSET_CDN } from '@/utils/config/endpoint'

const AD_ASSETS_URL = `${ASSET_CDN}/solana/promotions`

export const getImageUrl = memoize((asset: string) => `${AD_ASSETS_URL}/${asset}.png`)
