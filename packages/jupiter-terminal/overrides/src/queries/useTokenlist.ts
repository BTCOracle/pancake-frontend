import { useQuery } from '@tanstack/react-query'

export const useTokenList = () => {
  const { data: tokenList, isLoading } = useQuery({
    queryKey: ['tokenList'],
    queryFn: async () => {
      const response = await fetch('https://tokens.pancakeswap.finance/pancakeswap-solana-default.json')
      if (!response.ok) {
        throw new Error('Failed to fetch token list')
      }
      const data = await response.json()
      return data.tokens || []
    },
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  })

  return { tokenList, isLoading }
}
