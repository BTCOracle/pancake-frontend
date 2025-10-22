import { useCurrentBlockTimestamp as useBlockTimestamp } from 'state/block/hooks'
import { verifyBscNetwork } from 'utils/verifyBscNetwork'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { ChainId } from '@pancakeswap/chains'

export const useCurrentBlockTimestamp = () => {
  const { chainId } = useActiveChainId()
  const isBscNetwork = verifyBscNetwork(chainId)
  const timestamp = useBlockTimestamp(!isBscNetwork ? ChainId.BSC : undefined)

  return timestamp ?? 0
}
