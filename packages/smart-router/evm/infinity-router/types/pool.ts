import type { BigintIsh, Currency } from '@pancakeswap/swap-sdk-core'

import type { OnChainProvider } from '../../v3-router/types'
import { InfinityPoolTvlReferenceMap } from '../queries/getPoolTvl'

type WithMulticallGasLimit = {
  gasLimit?: BigintIsh
}

type WithClientProvider = {
  clientProvider?: OnChainProvider
}

type WithTVRefMap = {
  tvlRefMap?: InfinityPoolTvlReferenceMap
}

export type GetInfinityCandidatePoolsParams = {
  currencyA?: Currency
  currencyB?: Currency
} & WithClientProvider &
  WithMulticallGasLimit &
  WithTVRefMap
