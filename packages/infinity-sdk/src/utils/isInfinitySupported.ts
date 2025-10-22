import { ChainId } from '@pancakeswap/chains'

import { INFINITY_SUPPORTED_CHAINS } from '../constants'

type InfinitySupportedChain = (typeof INFINITY_SUPPORTED_CHAINS)[number]

export function isInfinitySupported(chainId: ChainId): chainId is InfinitySupportedChain {
  return INFINITY_SUPPORTED_CHAINS.includes(chainId as number)
}
