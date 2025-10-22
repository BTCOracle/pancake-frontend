import { useQuery } from '@tanstack/react-query'
import { BurnStats } from '../types'

export const useBurnStats = () => {
  return useQuery<BurnStats>({
    queryKey: ['burnStats'],
    queryFn: async () => {
      const response = await fetch('https://burn-stats.pancakeswap.com/data.json')
      if (!response.ok) {
        throw new Error('Error while fetching burn statistics')
      }
      return response.json()
    },
  })
}
