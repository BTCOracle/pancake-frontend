import { useActiveChainId } from 'hooks/useActiveChainId'
import { useSwitchNetwork } from 'hooks/useSwitchNetwork'
import { useCallback } from 'react'

export const useCheckShouldSwitchNetwork = () => {
  const { chainId: currentChainId } = useActiveChainId()
  const { switchNetwork, canSwitch, isLoading } = useSwitchNetwork()
  return {
    isLoading,
    switchNetworkIfNecessary: useCallback(
      async (chainId: number) => {
        if (canSwitch && currentChainId !== chainId) {
          await switchNetwork(chainId)
          return true
        }
        return false
      },
      [canSwitch, currentChainId, switchNetwork],
    ),
  }
}
