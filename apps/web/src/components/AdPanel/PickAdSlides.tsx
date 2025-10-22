import { memo } from 'react'
import { AdSlidesRender } from './AdSlidesRender'
import { usePicksConfig } from './hooks/usePicksConfig'
import { StaticContainer } from './StaticContainer'
import { AdPlayerProps } from './ads.types'

export const PickAdSlides = memo(({ forceMobile, isDismissible = true }: AdPlayerProps) => {
  const adList = usePicksConfig()
  if (!adList || adList.length < 3) return null
  return (
    <StaticContainer>
      <AdSlidesRender adList={adList} forceMobile={forceMobile} isDismissible={isDismissible} />
    </StaticContainer>
  )
})
