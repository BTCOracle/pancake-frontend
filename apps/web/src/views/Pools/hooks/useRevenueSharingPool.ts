import useAccountActiveChain from 'hooks/useAccountActiveChain'
import { publicClient } from 'utils/wagmi'
import { useRevenueSharingPoolContract } from 'hooks/useContract'
import { getRevenueSharingPoolAddress } from 'utils/addressHelpers'
import { Address } from 'viem'
import { revenueSharingPoolABI } from 'config/abi/revenueSharingPool'
import { ONE_WEEK_DEFAULT } from '@pancakeswap/pools'
import BigNumber from 'bignumber.js'
import { useInitialBlockTimestamp } from 'state/block/hooks'
import { useQuery } from '@tanstack/react-query'
import { useCurrentBlockTimestamp } from 'views/CakeStaking/hooks/useCurrentBlockTimestamp'

interface RevenueSharingPool {
  balanceOfAt: string
  totalSupplyAt: string
  nextDistributionTimestamp: number
  lastDistributionTimestamp: number
  availableClaim: string
}

const initialData: RevenueSharingPool = {
  balanceOfAt: '0',
  totalSupplyAt: '0',
  nextDistributionTimestamp: 0,
  lastDistributionTimestamp: 0,
  availableClaim: '0',
}

const useRevenueSharingPool = (): RevenueSharingPool => {
  const { account, chainId } = useAccountActiveChain()
  const contract = useRevenueSharingPoolContract({ chainId })
  const contractAddress = getRevenueSharingPoolAddress(chainId)
  const blockTimestamp = useInitialBlockTimestamp()
  const currentBlockTimestamp = useCurrentBlockTimestamp()

  const { data } = useQuery({
    queryKey: ['/revenue-sharing-pool', account, chainId],

    queryFn: async () => {
      if (!account) return undefined
      try {
        const now = Math.floor(blockTimestamp / ONE_WEEK_DEFAULT) * ONE_WEEK_DEFAULT
        const lastDistributionTimestamp = Math.floor(currentBlockTimestamp / ONE_WEEK_DEFAULT) * ONE_WEEK_DEFAULT
        const nextDistributionTimestamp = new BigNumber(lastDistributionTimestamp).plus(ONE_WEEK_DEFAULT).toNumber()

        const revenueCalls = [
          {
            functionName: 'balanceOfAt',
            address: contractAddress as Address,
            abi: revenueSharingPoolABI,
            args: [account, now],
          },
          {
            functionName: 'totalSupplyAt',
            address: contractAddress as Address,
            abi: revenueSharingPoolABI,
            args: [now],
          },
        ]

        const client = publicClient({ chainId })
        const [revenueResult, claimResult] = await Promise.all([
          client.multicall({
            contracts: revenueCalls,
            allowFailure: false,
          }),
          contract.simulate.claim([account]),
        ])

        return {
          balanceOfAt: (revenueResult[0] as any).toString(),
          totalSupplyAt: (revenueResult[1] as any).toString(),
          nextDistributionTimestamp,
          lastDistributionTimestamp,
          availableClaim: claimResult.result.toString(),
        }
      } catch (error) {
        console.error('[ERROR] Fetching Revenue Sharing Pool', error)
        throw error
      }
    },

    enabled: Boolean(account && chainId),
  })

  return data ?? initialData
}

export default useRevenueSharingPool
