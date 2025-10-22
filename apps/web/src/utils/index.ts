import { ChainId, NonEVMChainId } from '@pancakeswap/chains'
import { Currency } from '@pancakeswap/sdk'
import { TokenAddressMap } from '@pancakeswap/token-lists'
import { multiChainScanName } from 'state/info/constant'
import { bsc } from 'wagmi/chains'
import { CHAINS, SOLANA_CHAIN } from 'config/chains'

export * from './safeGetAddress'
export { useBlockExploreName, useBlockExploreLink } from '../hooks/useBlockExploreName'

// Extend chain metadata with Solana descriptor from config
const UNIFIED_CHAINS = CHAINS.concat(SOLANA_CHAIN as any)

type ExplorerType = 'transaction' | 'token' | 'address' | 'block' | 'countdown' | 'nft'

const defaultEvmBuilder = (baseUrl: string, data: string | number, type: ExplorerType) => {
  switch (type) {
    case 'transaction':
      return `${baseUrl}/tx/${data}`
    case 'token':
      return `${baseUrl}/token/${data}`
    case 'block':
      return `${baseUrl}/block/${data}`
    case 'countdown':
      return `${baseUrl}/block/countdown/${data}`
    case 'nft':
      return `${baseUrl}/nft/${data}`
    default:
      return `${baseUrl}/address/${data}`
  }
}

const solanaBuilder = (baseUrl: string, data: string | number, type: ExplorerType) => {
  switch (type) {
    case 'transaction':
      return `${baseUrl}/tx/${data}`
    case 'address':
      return `${baseUrl}/account/${data}`
    case 'token':
      return `${baseUrl}/token/${data}`
    case 'block':
      return `${baseUrl}/block/${data}`
    case 'nft':
      return `${baseUrl}/nft/${data}`
    case 'countdown':
    default:
      return baseUrl
  }
}

export const getSolExplorerLink = (data: string | number, type: ExplorerType, explorerHost = 'https://solscan.io') => {
  return solanaBuilder(explorerHost, data, type)
}

const EXPLORER_BUILDERS: Partial<
  Record<number, (baseUrl: string, data: string | number, type: ExplorerType) => string>
> = {
  [NonEVMChainId.SOLANA]: solanaBuilder,
}

export function getBlockExploreLink(
  data: string | number | undefined | null,
  type: ExplorerType,
  chainIdOverride?: number,
): string {
  const chainId = chainIdOverride || ChainId.BSC
  const chain = UNIFIED_CHAINS.find((c) => c.id === chainId)
  if (!chain || !data) return bsc.blockExplorers.default.url
  const baseUrl = (chain as any)?.blockExplorers?.default?.url as string
  const builder = EXPLORER_BUILDERS[chain.id] || defaultEvmBuilder
  return builder(baseUrl, data, type)
}

export function getBlockExploreName(chainIdOverride?: number) {
  const chainId = chainIdOverride || ChainId.BSC
  const chain = UNIFIED_CHAINS.find((c) => c.id === chainId)

  return multiChainScanName[chain?.id || -1] || chain?.blockExplorers?.default.name || bsc.blockExplorers.default.name
}

export function getBscScanLinkForNft(collectionAddress: string | undefined, tokenId?: string): string {
  if (!collectionAddress) return ''
  return `${bsc.blockExplorers.default.url}/token/${collectionAddress}?a=${tokenId}`
}

// add 10%
export function calculateGasMargin(value: bigint, margin = 1000n): bigint {
  return (value * (10000n + margin)) / 10000n
}

export function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // $& means the whole matched string
}

export function isTokenOnList(defaultTokens: TokenAddressMap<ChainId>, currency?: Currency): boolean {
  if (currency?.isNative) return true
  return Boolean(currency?.isToken && defaultTokens[currency.chainId]?.[currency.address])
}

export function truncateText(text: string | undefined, maxLength: number = 200) {
  if (!text) return ''

  if (text.length > maxLength) {
    return `${text.slice(0, maxLength)}...`
  }

  return text
}
