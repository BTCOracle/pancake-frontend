import { Token, getTokenComparator } from '@pancakeswap/sdk'
import { useMemo } from 'react'
import { useAllTokenBalances } from '../state/wallet/hooks'

export function useTokenComparator(inverted: boolean, chainId?: number): (tokenA: Token, tokenB: Token) => number {
  const { balances } = useAllTokenBalances(chainId)
  const comparator = useMemo(() => getTokenComparator(balances ?? {}), [balances])

  return useMemo(() => {
    return (tokenA: Token, tokenB: Token) => {
      const balanceA = balances?.[tokenA.address]?.toExact() || '0'
      const balanceB = balances?.[tokenB.address]?.toExact() || '0'

      if (balanceA === balanceB) return 0

      const result = comparator(tokenA, tokenB)
      return inverted ? result * -1 : result
    }
  }, [inverted, comparator, balances])
}
