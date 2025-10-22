import { PublicKey } from '@solana/web3.js'
import { useMemo } from 'react'
import { useTokenAccountStore } from '@/store'

export const useSolBalance = () => {
  const [getTokenBalanceUiAmount] = useTokenAccountStore((s) => [s.getTokenBalanceUiAmount])

  const balance = useMemo(() => {
    return getTokenBalanceUiAmount({ mint: PublicKey.default, decimals: 9 })
  }, [getTokenBalanceUiAmount])

  return balance
}
