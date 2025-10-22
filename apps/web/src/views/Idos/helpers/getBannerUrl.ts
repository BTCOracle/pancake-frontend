import { ASSET_CDN } from 'config/constants/endpoints'
import bgImage from '../images/ido-banner.png'

export function getBannerUrl(idoId: string) {
  return `${ASSET_CDN}/web/ido/${idoId}-banner.png`
}

export function getTempBannerUrl() {
  return bgImage.src
}
