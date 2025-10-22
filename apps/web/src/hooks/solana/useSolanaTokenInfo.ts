import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { PublicKey } from '@solana/web3.js'
import type { TokenInfo } from '@pancakeswap/solana-core-sdk'
import { SPLToken } from '@pancakeswap/swap-sdk-core'
import { convertRawTokenInfoIntoSPLToken } from 'config/solana-list'
import { useSolanaTokenList } from 'hooks/solana/useSolanaTokenList'

const API_ENDPOINT = process.env.NEXT_PUBLIC_SOLANA_EXPLORE_API_ENDPOINT

const isValidAddress = (address?: string) => {
  if (!address) return false
  try {
    // will throw if invalid
    const _ = new PublicKey(address)
    return true
  } catch {
    return false
  }
}

export function useSolanaTokenInfo(
  address?: string,
  opts?: {
    enabled?: boolean
  },
): SPLToken | undefined | null {
  const { tokenList } = useSolanaTokenList()
  const token = useMemo(() => tokenList.find((t) => t.address === address), [tokenList, address])

  const enabled = (opts?.enabled ?? true) && !token && isValidAddress(address)

  const { data, isLoading } = useQuery({
    queryKey: ['solana-token-info', address],
    queryFn: async () => {
      if (!address || !API_ENDPOINT) return undefined
      const resp = await fetch(`${API_ENDPOINT}/cached/v1/tokens/metadata/${address}`)
      if (!resp.ok) throw new Error('Failed to fetch token metadata')
      const json = await resp.json()
      const info = json?.data as TokenInfo | undefined
      return info ? convertRawTokenInfoIntoSPLToken(info) : undefined
    },
    enabled,
    staleTime: Infinity,
  })

  if (token) return token
  if (enabled && isLoading) return null
  return data
}
