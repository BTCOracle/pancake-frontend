import { Protocol } from '@pancakeswap/farms'
import { getDefaultStore } from 'jotai'
import {
  InfinityBinPositionDetail,
  InfinityCLPositionDetail,
  SolanaV3PositionDetail,
  UnifiedPositionDetail,
} from 'state/farmsV4/state/accountPositions/type'
import { Native, ZERO_ADDRESS } from '@pancakeswap/sdk'
import { isSolana } from '@pancakeswap/chains'
import { tokensMapAtom } from '../atom/tokensMapAtom'

const store = getDefaultStore()

const getSymbolTags = (chainId: number, address: string) => {
  const { tokensMap } = store.get(tokensMapAtom)
  const key = `${chainId}:${address}`.toLowerCase()
  const relatedToken = tokensMap[key]
  const tags = new Set<string>()
  if (relatedToken) {
    if (Native.onChain(chainId).wrapped.address.toLowerCase() === relatedToken.address.toLowerCase()) {
      tags.add(Native.onChain(chainId).symbol.toLowerCase())
    }
    if (relatedToken.address.toLowerCase() === ZERO_ADDRESS.toLowerCase()) {
      tags.add(Native.onChain(chainId).symbol.toLowerCase())
    }
    tags.add(relatedToken?.symbol?.toLowerCase() || '')
  }
  return [...tags]
}

export function matchPositionSearch(pos: UnifiedPositionDetail, search: string) {
  if (!search) return true
  const parts = search
    .toLowerCase()
    .split(/[\s,]+/)
    .filter(Boolean)
  if (!parts.length) return true

  const tags: string[] = []
  switch (pos.protocol) {
    case Protocol.InfinityCLAMM: {
      const symbolTags0 = getSymbolTags(pos.chainId, (pos as InfinityCLPositionDetail).token0)
      const symbolTags1 = getSymbolTags(pos.chainId, (pos as InfinityCLPositionDetail).token1)
      tags.push(...symbolTags0, ...symbolTags1)
      tags.push('infinity', 'clamm')
      break
    }
    case Protocol.InfinityBIN: {
      const { poolKey } = pos as InfinityBinPositionDetail
      const c0 = poolKey?.currency0
      const c1 = poolKey?.currency1
      const symbolTags0 = c0 ? getSymbolTags(pos.chainId, c0) : []
      const symbolTags1 = c1 ? getSymbolTags(pos.chainId, c1) : []
      tags.push(...symbolTags0, ...symbolTags1)
      tags.push('infinity', 'bin', 'lbamm')
      break
    }
    case Protocol.V3: {
      if (isSolana(pos.chainId)) {
        const { token0, token1 } = pos as SolanaV3PositionDetail
        if (!token0 || !token1) break
        tags.push(...[token0.symbol.toLowerCase(), token1.symbol.toLowerCase(), 'v3'])
        break
      }
      const symbolTags0 = getSymbolTags(pos.chainId, (pos as any).token0)
      const symbolTags1 = getSymbolTags(pos.chainId, (pos as any).token1)
      tags.push(...symbolTags0, ...symbolTags1, 'v3')
      break
    }
    case Protocol.V2: {
      const { pair } = pos as any
      const addr0 = pair.token0.address
      const addr1 = pair.token1.address
      const { chainId } = pair.token0
      const symbolTags0 = getSymbolTags(chainId, addr0)
      const symbolTags1 = getSymbolTags(chainId, addr1)
      tags.push(...symbolTags0, ...symbolTags1, 'v2')

      break
    }
    case Protocol.STABLE: {
      const { pair } = pos as any
      const s0 = pair.token0.symbol.toLowerCase()
      const s1 = pair.token1.symbol.toLowerCase()
      tags.push(s0, s1, 'stable', 'ss')
      break
    }
    default:
      break
  }

  return parts.every((prt) => tags.some((tag) => tag.startsWith(prt)))
}
