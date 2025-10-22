import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { Address } from 'viem'
import { useAccount } from 'wagmi'

export const fetchAffiliateList = async (account: Address): Promise<any> => {
  const response = await fetch(`https://proofs.pancakeswap.com/aff-program/v2/${account.toLowerCase()}`)
  if (!response.ok) {
    throw new Error('User is not in affiliate list')
  }
  return true
}

export const useUserIsInAffiliateListData = () => {
  const { address: account } = useAccount()
  const { data } = useQuery({
    queryKey: ['IsInAffiliateListData', account],
    queryFn: async () => {
      try {
        await fetchAffiliateList(account!)
        return true
      } catch (error) {
        return false
      }
    },
    enabled: Boolean(account),
  })

  return useMemo(() => data ?? false, [data])
}
