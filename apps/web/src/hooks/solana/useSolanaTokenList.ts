import { useEffect, useMemo, useState, useCallback } from 'react'

import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { solanaTokenListAtom, solanaListSettingsAtom } from 'state/token/solanaTokenAtoms'

import type { TokenInfo } from '@pancakeswap/solana-core-sdk'
import type { SPLToken } from '@pancakeswap/swap-sdk-core'

import { useQuery } from '@tanstack/react-query'
import { SOLANA_LISTS_CONFIG, TokenListKey, USER_ADDED_KEY, convertRawTokenInfoIntoSPLToken } from 'config/solana-list'
import { atomWithStorage } from 'jotai/utils'
import { QUERY_SETTINGS_IMMUTABLE } from 'config/constants'

// Custom hook for individual token list queries
function useTokenListQuery(listKey: TokenListKey, enabled: boolean) {
  const listSettings = useAtomValue(solanaListSettingsAtom)
  // PancakeSwap list is always enabled
  const isEnabled = listKey === TokenListKey.PANCAKESWAP ? true : listSettings[listKey]
  const listConfig = SOLANA_LISTS_CONFIG[listKey]

  return useQuery({
    queryKey: ['solana-token-list', listConfig.key, isEnabled && enabled],
    queryFn: async () => {
      const res = await fetch(listConfig.apiUrl)
      if (!res.ok) {
        throw new Error(`${listConfig.name} list fetch failed`)
      }

      return res.json()
    },
    retry: 3,
    ...QUERY_SETTINGS_IMMUTABLE,
    enabled: isEnabled && enabled,
    select: (data) => {
      return listConfig.parser(data).filter((token) => token.name && token.symbol)
    },
  })
}

const userTokensAtom = atomWithStorage<TokenInfo[]>(USER_ADDED_KEY, [])

export function useSolanaTokenList(enabled = true) {
  const [userTokens, setUserTokens] = useAtom(userTokensAtom)
  const setTokenList = useSetAtom(solanaTokenListAtom)

  // Create individual queries for each token list using the custom hook
  const { data: pcsTokens, isLoading: pcsLoading } = useTokenListQuery(TokenListKey.PANCAKESWAP, enabled)
  const { data: raydiumTokens, isLoading: raydiumLoading } = useTokenListQuery(TokenListKey.RAYDIUM, enabled)
  const { data: jupiterTokens, isLoading: jupiterLoading } = useTokenListQuery(TokenListKey.JUPITER, enabled)

  const mergedTokens = useMemo(() => {
    const seen = new Set<string>()
    const result: SPLToken[] = []

    const addTokens = (tokens: SPLToken[] | undefined) => {
      if (!tokens) return
      for (const token of tokens) {
        if (!seen.has(token.address)) {
          seen.add(token.address)
          result.push(token)
        }
      }
    }

    // Process in priority order
    addTokens(pcsTokens)
    addTokens(userTokens.map(convertRawTokenInfoIntoSPLToken))
    addTokens(raydiumTokens)
    addTokens(jupiterTokens)

    return result
  }, [pcsTokens?.length, raydiumTokens?.length, jupiterTokens?.length, userTokens])

  useEffect(() => {
    setTokenList(mergedTokens)
  }, [mergedTokens, setTokenList])

  // Loading state: true if any enabled query is still loading

  // Add a user token and persist
  const addUserToken = useCallback((token: TokenInfo) => {
    setUserTokens((prev) => {
      const next = prev.some((t) => t.address === token.address) ? prev : [...prev, token]

      return next
    })
  }, [])

  // Remove a user token and persist
  const removeUserToken = useCallback((addresses: string[] | string) => {
    setUserTokens((prev) => {
      const addressesToRemove = Array.isArray(addresses) ? addresses : [addresses]
      const next = prev.filter((t) => !addressesToRemove.includes(t.address))
      return next
    })
  }, [])

  const removeAllUserTokens = useCallback(() => {
    if (userTokens.length > 0) {
      setUserTokens([])
    }
  }, [userTokens])

  const tokenCountsByList = useMemo(() => {
    return {
      [TokenListKey.PANCAKESWAP]: pcsTokens?.length ?? 0,
      [TokenListKey.RAYDIUM]: raydiumTokens?.length ?? 0,
      [TokenListKey.JUPITER]: jupiterTokens?.length ?? 0,
    }
  }, [pcsTokens?.length, raydiumTokens?.length, jupiterTokens?.length])

  return useMemo(
    () => ({
      tokenList: mergedTokens,
      loading: pcsLoading || raydiumLoading || jupiterLoading,
      addUserToken,
      removeUserToken,
      tokenCountsByList,
      userTokens,
      removeAllUserTokens,
    }),
    [
      mergedTokens,
      userTokens,
      pcsLoading,
      raydiumLoading,
      jupiterLoading,
      addUserToken,
      removeUserToken,
      tokenCountsByList,
      removeAllUserTokens,
    ],
  )
}
