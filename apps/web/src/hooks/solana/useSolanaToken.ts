import { useEffect, useMemo } from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import { solanaTokenAtomFamily, solanaTokenListAtom } from 'state/token/solanaTokenAtoms'

import { SPLToken } from '@pancakeswap/swap-sdk-core'
import { useSolanaTokenInfo } from './useSolanaTokenInfo'

export function useSolanaToken(address?: string): SPLToken | undefined {
  const tokenFromAtom = useAtomValue(solanaTokenAtomFamily(address))
  const setTokenList = useSetAtom(solanaTokenListAtom)

  // Fallback: try fetch token info if not in atom list
  const shouldFetch = !tokenFromAtom && Boolean(address)
  const fetchedToken = useSolanaTokenInfo(address, { enabled: shouldFetch })

  // When fetchedToken resolves to a SPLToken, store it in the atom list if missing
  useEffect(() => {
    if (!address || !fetchedToken) return
    if (fetchedToken === null) return // still loading

    setTokenList((prev) => {
      if (prev.some((t) => t.address === address)) return prev
      return [...prev, fetchedToken]
    })
  }, [address, fetchedToken, setTokenList])

  return useMemo(
    () => tokenFromAtom ?? (fetchedToken && fetchedToken !== null ? fetchedToken : undefined),
    [tokenFromAtom, fetchedToken],
  )
}
