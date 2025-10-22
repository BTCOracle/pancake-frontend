import { useState, useEffect } from 'react'
import { TokenInfo } from '@pancakeswap/solana-core-sdk'
import { PublicKey } from '@solana/web3.js'
import { useTokenStore } from '@/store/useTokenStore'
import { useAppStore } from '@/store/useAppStore'
import { getMintSymbol } from '@/utils/token'
import { getTokenInfo } from './api'

export default function useTokenInfo({
  mint,
  programId,
  skipTokenMap
}: {
  mint?: string | PublicKey
  programId?: PublicKey | undefined
  skipTokenMap?: boolean
}) {
  const tokenMap = useTokenStore((s) => s.tokenMap)
  const connection = useAppStore((s) => s.connection)
  const [loading, setLoading] = useState<boolean>(true)
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | undefined>(undefined)

  useEffect(() => {
    if (tokenMap.size < 1) return
    if (!mint) {
      setLoading(false)
      setTokenInfo(undefined)
      return
    }
    const info = skipTokenMap ? undefined : tokenMap.get(mint.toString())

    if (!info) {
      setLoading(true)
      getTokenInfo({ mint, connection, programId }).then((r) => {
        if (r)
          setTokenInfo({
            ...r,
            symbol: getMintSymbol({ mint: r })
          })
        setLoading(false)
      })
      return
    }

    setTokenInfo(info)
    setLoading(false)
  }, [mint, tokenMap, connection, programId])

  return { loading, tokenInfo }
}
