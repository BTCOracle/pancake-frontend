import { ASSET_CDN } from 'config/constants/endpoints'
import memoize from 'lodash/memoize'

const AD_ASSETS_URL = `${ASSET_CDN}/web/promotions`

export const getImageUrl = memoize((asset: string) => `${AD_ASSETS_URL}/${asset}.png`)
