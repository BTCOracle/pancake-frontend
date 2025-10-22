import { ChainId, NonEVMChainId, testnetChainIds, UnifiedChainId } from './chainId'
import {
  chainNameToChainId,
  chainNames,
  chainNamesInKebabCase,
  defiLlamaChainNames,
  mainnetChainNamesInKebabCase,
} from './chainNames'

export function getChainName(chainId: UnifiedChainId) {
  return chainNames[chainId]
}

export function getChainNameInKebabCase(chainId: UnifiedChainId) {
  return chainNamesInKebabCase[chainId]
}

export function getMainnetChainNameInKebabCase(chainId: keyof typeof mainnetChainNamesInKebabCase) {
  return mainnetChainNamesInKebabCase[chainId]
}

export function getLlamaChainName(chainId: ChainId) {
  return defiLlamaChainNames[chainId]
}

export function getChainIdByChainName(chainName?: string): UnifiedChainId | undefined {
  if (!chainName) return undefined
  return chainNameToChainId[chainName] ?? undefined
}

export function isTestnetChainId(chainId: UnifiedChainId) {
  return testnetChainIds.includes(chainId as ChainId)
}

export function isEvm(chainId?: number) {
  if (!chainId) return false
  return chainId < 1_000_000
}

export function isSolana(chainId?: UnifiedChainId) {
  if (!chainId) return false
  return chainId === NonEVMChainId.SOLANA
}

export function isAptos(chainId?: UnifiedChainId) {
  if (!chainId) return false
  return chainId === NonEVMChainId.APTOS
}

export function isChainSupported(chainId?: UnifiedChainId) {
  if (!chainId) return false
  return (
    Object.values(ChainId).includes(chainId as ChainId) ||
    Object.values(NonEVMChainId).includes(chainId as NonEVMChainId)
  )
}
