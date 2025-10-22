import { ChainId } from '@pancakeswap/chains'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { useAccount } from 'wagmi'
import { NEXT_PUBLIC_GIFT_API, QUERY_KEY_GIFT_INFO } from '../constants'
import { ClaimGiftParams, ClaimGiftRequest, ClaimGiftResponse, GiftApiResponse, GiftApiStatus } from '../types'

export const useClaimGift = ({ onSuccess }: { onSuccess?: () => void }) => {
  const { address: account } = useAccount()
  const { chainId } = useActiveChainId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ code }: ClaimGiftParams): Promise<GiftApiResponse<ClaimGiftResponse>> => {
      if (!chainId || !account) {
        throw new Error('Missing required parameters: chainId and account')
      }

      if (!NEXT_PUBLIC_GIFT_API) {
        throw new Error('NEXT_PUBLIC_GIFT_API environment variable is not configured')
      }

      const url = `${NEXT_PUBLIC_GIFT_API}/gift/claim`

      const requestBody: ClaimGiftRequest = {
        // NOTE: hardcode to bsc for now
        // If support other chains, we need get chainId from API response before claim gift
        chainId: ChainId.BSC,
        address: account,
        code,
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        throw new Error(`Check the gift status before trying again.`)
      }

      const result: GiftApiResponse<ClaimGiftResponse> = await response.json()

      if (result.status === GiftApiStatus.FAILED) {
        throw new Error(result.message || 'Claim gift Status is failed.')
      }

      if (!result.data) {
        throw new Error('No data returned from claim gift API.')
      }

      // wait for 4 seconds so API can update the gift status
      await new Promise((resolve) => setTimeout(resolve, 4000))

      return result
    },
    onSuccess: () => {
      // Invalidate gift-related queries to refresh the data
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY_GIFT_INFO, chainId, account] })
      onSuccess?.()
    },
  })
}
