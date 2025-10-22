import { ONE_WEEK_DEFAULT } from '@pancakeswap/pools'
import { useQuery } from '@tanstack/react-query'
import BigNumber from 'bignumber.js'
import { WEEK } from 'config/constants/veCake'
import { publicClient } from 'utils/wagmi'
import { useAccount } from 'wagmi'
import {
  useRevenueSharingCakePoolContract,
  useRevenueSharingPoolGatewayContract,
  useRevenueSharingVeCakeContract,
} from '../../../hooks/useContract'
import { poolStartWeekCursors } from '../config'
import { useCurrentBlockTimestamp } from './useCurrentBlockTimestamp'

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

export const useRevenueSharingProxy = (
  contract: ReturnType<typeof useRevenueSharingCakePoolContract | typeof useRevenueSharingVeCakeContract>,
) => {
  const { address: account } = useAccount()
  const currentBlockTimestamp = useCurrentBlockTimestamp()
  const gatewayContract = useRevenueSharingPoolGatewayContract()

  const { data, refetch } = useQuery({
    queryKey: ['/revenue-sharing-pool-for-cake', contract.address, contract.chain?.id, account],
    queryFn: async () => {
      if (!account || !currentBlockTimestamp) return undefined
      try {
        const lastDistributionTimestamp = Math.floor(currentBlockTimestamp / ONE_WEEK_DEFAULT) * ONE_WEEK_DEFAULT
        const nextDistributionTimestamp = new BigNumber(lastDistributionTimestamp).plus(ONE_WEEK_DEFAULT).toNumber()

        const revenueCalls = [
          {
            ...contract,
            functionName: 'balanceOfAt',
            args: [account, lastDistributionTimestamp],
          },
          {
            ...contract,
            functionName: 'totalSupplyAt',
            args: [lastDistributionTimestamp],
          },
        ]

        const client = publicClient({ chainId: contract.chain?.id })
        const poolLength = Math.ceil((currentBlockTimestamp - poolStartWeekCursors[contract.address]) / WEEK / 52)
        const [revenueResult, claimResult] = await Promise.all([
          client.multicall({
            contracts: revenueCalls,
            allowFailure: false,
          }),
          gatewayContract.simulate.claimMultiple([Array(poolLength).fill(contract.address), account]),
        ])

        return {
          balanceOfAt: (revenueResult[0] as any).toString(),
          totalSupplyAt: (revenueResult[1] as any).toString(),
          nextDistributionTimestamp,
          lastDistributionTimestamp,
          availableClaim: claimResult.result.toString(),
        }
      } catch (error) {
        console.warn('[ERROR] Fetching Revenue Sharing Pool', error)
        throw error
      }
    },
    enabled: Boolean(account && currentBlockTimestamp),
  })

  return {
    data: data ?? initialData,
    refetch,
  }
}

export const useRevenueSharingCakePool = () => {
  const contract = useRevenueSharingCakePoolContract()
  return useRevenueSharingProxy(contract)
}

export const useRevenueSharingVeCake = () => {
  const contract = useRevenueSharingVeCakeContract()
  return useRevenueSharingProxy(contract)
}
