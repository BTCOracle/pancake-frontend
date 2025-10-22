import { useQuery } from '@tanstack/react-query'
import useAccountActiveChain from 'hooks/useAccountActiveChain'
import { useLatestTxReceipt } from 'state/farmsV4/state/accountPositions/hooks/useLatestTxReceipt'
import { useIDOContract } from './useIDOContract'

export type IDOUserInfo = {
  amountPool: bigint
  claimedPool: boolean
}

export const useIDOUserInfo = () => {
  const { chainId, account } = useAccountActiveChain()
  const idoContract = useIDOContract()
  const latestTxReceipt = useLatestTxReceipt()

  return useQuery({
    queryKey: ['idoUserInfo', account, chainId, latestTxReceipt],
    queryFn: async (): Promise<[IDOUserInfo, IDOUserInfo]> => {
      if (!account || !idoContract) throw new Error('IDO contract not found')

      const [amountPools, claimedPools] = await idoContract.read.viewUserInfo([
        account,
        [0, 1], // @note: hardcode for now, as we currently only support max 2 pool
      ])

      return [
        {
          amountPool: amountPools[0],
          claimedPool: claimedPools[0],
        },
        {
          amountPool: amountPools[1],
          claimedPool: claimedPools[1],
        },
      ]
    },
    enabled: !!account && !!idoContract,
  })
}
