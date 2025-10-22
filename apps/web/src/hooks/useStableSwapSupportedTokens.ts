import { ChainId } from '@pancakeswap/chains'
import { getStableSwapPools, isStableSwapSupported } from '@pancakeswap/stable-swap-sdk'
import { SerializedToken, Token } from '@pancakeswap/swap-sdk-core'
import { useQuery } from '@tanstack/react-query'
import { Address } from 'viem/accounts'

export function useStableSwapSupportedTokens(chainId?: ChainId, token?: Token) {
  return useQuery({
    queryKey: ['stableswap-supported-tokens', chainId, token?.address],

    queryFn: async () => {
      if (!isStableSwapSupported(chainId)) return []
      const pools = await getStableSwapPools(chainId)
      const map = new Map<Address, Token>()
      const addToken = (t: SerializedToken) =>
        map.set(t.address, new Token(t.chainId, t.address, t.decimals, t.symbol, t.name))
      for (const p of pools) {
        if (!token) {
          addToken(p.token)
          addToken(p.quoteToken)
          continue
        }
        if (p.token.address !== token.address && p.quoteToken.address !== token.address) {
          continue
        }
        addToken(p.token.address === token.address ? p.quoteToken : p.token)
      }
      return Array.from(map.values())
    },

    refetchInterval: false,
    refetchOnWindowFocus: false,
  })
}
