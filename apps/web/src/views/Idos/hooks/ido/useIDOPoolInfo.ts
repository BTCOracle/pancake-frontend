import { useQuery } from '@tanstack/react-query'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { useLatestTxReceipt } from 'state/farmsV4/state/accountPositions/hooks/useLatestTxReceipt'
import { getViemClients } from 'utils/viem'
import type { Address } from 'viem'
import { useIDOContract } from './useIDOContract'

export type PoolInfo = {
  pid: number
  /**
   * token address that is used to stake in the pool
   */
  poolToken: Address
  /**
   * Amount of tokens raised in the pool
   */
  raisingAmountPool: bigint
  /**
   * Amount of tokens offered in the pool
   *
   * if pool is not offering tokens, it will be 0
   */
  offeringAmountPool: bigint
  /**
   * Maximum amount of tokens a user can stake in the pool
   */
  capPerUserInLP: bigint
  /**
   * Total amount of tokens staked in the pool
   */
  totalAmountPool: bigint
}

export type IDOPoolInfo = {
  pool0Info: PoolInfo | undefined
  pool1Info: PoolInfo | undefined
  /**
   * Start timestamp of the pool
   */
  startTimestamp: number
  /**
   * End timestamp of the pool
   */
  endTimestamp: number
}

export const useIDOPoolInfo = () => {
  const { chainId } = useActiveChainId()
  const idoContract = useIDOContract()
  const latestTxReceipt = useLatestTxReceipt()

  return useQuery({
    queryKey: ['idoPoolInfo', chainId, latestTxReceipt],
    queryFn: async (): Promise<IDOPoolInfo> => {
      const publicClient = getViemClients({ chainId })
      if (!idoContract || !publicClient) throw new Error('IDO contract not found')

      const [pool0Token, pool1Token, _pool0Info, _pool1Info, startTimestamp, endTimestamp] =
        await publicClient.multicall({
          contracts: [
            {
              address: idoContract.address,
              abi: idoContract.abi,
              functionName: 'addresses',
              args: [0n],
            },
            {
              address: idoContract.address,
              abi: idoContract.abi,
              functionName: 'addresses',
              args: [1n],
            },
            {
              address: idoContract.address,
              abi: idoContract.abi,
              functionName: '_poolInformation',
              args: [0n],
            },
            {
              address: idoContract.address,
              abi: idoContract.abi,
              functionName: '_poolInformation',
              args: [1n],
            },
            {
              address: idoContract.address,
              abi: idoContract.abi,
              functionName: 'startTimestamp',
            },
            {
              address: idoContract.address,
              abi: idoContract.abi,
              functionName: 'endTimestamp',
            },
          ],
          allowFailure: false,
        })

      const pool0Info = {
        pid: 0,
        poolToken: pool0Token,
        raisingAmountPool: _pool0Info[0],
        offeringAmountPool: _pool0Info[1],
        capPerUserInLP: _pool0Info[2],
        totalAmountPool: _pool0Info[3],
      }

      const pool1Info = {
        pid: 1,
        poolToken: pool1Token,
        raisingAmountPool: _pool1Info[0],
        offeringAmountPool: _pool1Info[1],
        capPerUserInLP: _pool1Info[2],
        totalAmountPool: _pool1Info[3],
      }

      return {
        pool0Info: pool0Info.offeringAmountPool > 0n ? pool0Info : undefined,
        pool1Info: pool1Info.offeringAmountPool > 0n ? pool1Info : undefined,
        startTimestamp: Number(startTimestamp),
        endTimestamp: Number(endTimestamp),
      }
    },
    enabled: !!idoContract,
  })
}
