import { isSolana } from '@pancakeswap/chains'
import { supportedChainIdV4 } from '@pancakeswap/farms'
import { Native, ZERO_ADDRESS } from '@pancakeswap/sdk'
import { TokenInfo } from '@pancakeswap/token-lists'
import { atom } from 'jotai'
import { listsAtom } from 'state/lists/lists'

export const tokensMapAtom = atom((get) => {
  const state = get(listsAtom)

  const nativeTokens = supportedChainIdV4
    .filter((x) => !isSolana(x))
    .map((x) => Native.onChain(x))
    .map((native) => {
      return {
        chainId: native.chainId,
        address: ZERO_ADDRESS,
        symbol: native.symbol,
        name: native.name,
        decimals: native.decimals,
      } as TokenInfo
    })

  const records: Record<string, TokenInfo> = {}
  const symbols: Record<string, TokenInfo[]> = {}

  function addToSymbolsMap(token: TokenInfo, key?: string) {
    const symbolKey = key || token.symbol.toLowerCase()
    if (!symbols[symbolKey]) {
      symbols[symbolKey] = []
    }
    if (!symbols[symbolKey].find((x) => x.chainId === token.chainId && x.address === token.address)) {
      symbols[symbolKey].push(token)
    }
  }

  Object.keys(state.byUrl).forEach((url) => {
    const list = state.byUrl[url]
    if (list.current) {
      list.current.tokens.forEach((token) => {
        records[`${token.chainId}:${token.address}`.toLowerCase()] = token
        addToSymbolsMap(token)
      })
    }
  })

  for (const native of nativeTokens) {
    records[`${native.chainId}:${ZERO_ADDRESS}`.toLowerCase()] = native
    const { wrapped } = Native.onChain(native.chainId)
    addToSymbolsMap(native)
    addToSymbolsMap(native, wrapped.symbol.toLowerCase())
  }

  return {
    tokensMap: records,
    symbolsMap: symbols,
  }
})
