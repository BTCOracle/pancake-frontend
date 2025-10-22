import { chainFullNames, UnifiedChainId } from '@pancakeswap/chains'

export function getChainFullName(chainId: UnifiedChainId) {
  return chainFullNames[chainId]
}
