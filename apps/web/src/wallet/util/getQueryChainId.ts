import { isAptos, ChainId, getChainIdByChainName } from '@pancakeswap/chains'
import safeGetWindow from '@pancakeswap/utils/safeGetWindow'

export function getQueryChainId() {
  const window = safeGetWindow()
  if (!window) {
    return ChainId.BSC
  }
  const params = new URL(window.location.href).searchParams
  const chainId = getChainIdByChainName(params.get('chain') || '')
  // Aptos not supported in web
  if (!chainId || isAptos(chainId)) {
    return undefined
  }
  return chainId
}
