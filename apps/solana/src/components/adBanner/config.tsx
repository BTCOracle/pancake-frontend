import { AdSlide, Priority } from '@pancakeswap/widgets-internal'
import { pageRoutePathnames } from '@/utils/config/routers'

import { AdPCSxSolana } from './ads/AdPCSxSolana'

export const adList: Array<AdSlide> = [
  {
    id: 'expandable-ad',
    component: <AdPCSxSolana />,
    priority: Priority.FIRST_AD
  }
]

export const commonLayoutWhitelistedPages = [pageRoutePathnames.swap]
