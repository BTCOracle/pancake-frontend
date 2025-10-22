import { useMemo } from 'react'
import { useSolanaTokenList } from 'hooks/solana/useSolanaTokenList'
import { NonEVMChainId } from '@pancakeswap/chains'

/**
 * Enhanced token logo hook that looks up better logoURIs from token lists
 * Performance-optimized with memoization
 */
export function useEnhancedTokenLogo() {
  const { tokenList } = useSolanaTokenList()

  // Create a memoized lookup map for O(1) lookups
  const tokenLogoMap = useMemo(() => {
    const map = new Map<string, string>()

    tokenList.forEach((token) => {
      if (token.logoURI) {
        map.set(token.address.toLowerCase(), token.logoURI)
      }
    })

    return map
  }, [tokenList])

  // Memoized function to get enhanced logo URI
  const getEnhancedLogoURI = useMemo(() => {
    return (tokenAddress: string, chainId: number, currentLogoURI?: string): string | undefined => {
      // Only enhance Solana tokens
      if (chainId !== NonEVMChainId.SOLANA) {
        return currentLogoURI
      }

      // If we already have a good logo URI, keep it
      if (currentLogoURI && !currentLogoURI.includes('placeholder') && !currentLogoURI.includes('unknown')) {
        return currentLogoURI
      }

      // Look up in token list for better logo
      const enhancedLogo = tokenLogoMap.get(tokenAddress.toLowerCase())
      if (enhancedLogo) {
        return enhancedLogo
      }

      // Fallback to original
      return currentLogoURI
    }
  }, [tokenLogoMap])

  return {
    getEnhancedLogoURI,
    isTokenListLoaded: tokenList.length > 0,
  }
}
