import { useActiveChainId } from 'hooks/useActiveChainId'
import { useQuery } from '@tanstack/react-query'
import { getViemClients } from 'utils/viem'
import { useIfoV2Context } from 'views/Cakepad/contexts/useIfoV2Context'
import type { VestingInfo } from '../../ifov2.types'

export const useVestingInfo = (): VestingInfo | undefined => {
  const { chainId } = useActiveChainId()
  const { ifoContract } = useIfoV2Context()

  const { data } = useQuery({
    queryKey: ['ifoVestingInfo', chainId, ifoContract?.address],
    queryFn: async (): Promise<VestingInfo | undefined> => {
      if (!ifoContract) return undefined
      const publicClient = getViemClients({ chainId })
      if (!publicClient) throw new Error('public client not found')
      const [startTime, [percentage, cliff, duration]] = await Promise.all([
        ifoContract.read.vestingStartTime(),
        ifoContract.read.viewPoolVestingInformation([0n]),
      ])
      const percentageNumber = Number(percentage)
      const durationNumber = Number(duration)
      return {
        startTime: Number(startTime),
        percentage: percentageNumber,
        cliff: Number(cliff),
        duration: durationNumber,
        rate: durationNumber > 0 ? percentageNumber / durationNumber : 0,
      }
    },
    enabled: !!ifoContract,
  })

  return data
}

export default useVestingInfo
