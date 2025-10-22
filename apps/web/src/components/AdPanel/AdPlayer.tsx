import { memo } from 'react'
import { useAdConfig } from './config'
import { commonLayoutWhitelistedPages } from './constants'
import { shouldRenderOnPages } from './renderConditions'
import { AdPlayerProps } from './ads.types'
import { AdSlidesRender } from './AdSlidesRender'

/**
 * For abstraction and use in pages where we need to
 * directly render the Ads Card purely without any conditions.
 * > Note that dismissing Ads elsewhere in the application via useShowAdPanel
 * does not affect this component's visibility.
 */
export const AdPlayer = ({ forceMobile = true, isDismissible = false, ...props }: AdPlayerProps) => {
  if (!shouldRenderOnPages(commonLayoutWhitelistedPages)) return null // Remove in future releases when we're displaying on all pages
  return <AdSlides forceMobile={forceMobile} isDismissible={isDismissible} {...props} />
}
const AdSlides = memo(({ forceMobile, isDismissible = true }: AdPlayerProps) => {
  const adList = useAdConfig()
  return <AdSlidesRender adList={adList} forceMobile={forceMobile} isDismissible={isDismissible} />
})
