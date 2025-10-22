import { type PoolKey } from '@pancakeswap/infinity-sdk'
import { useRemoveClLiquidity } from 'hooks/infinity/useRemoveClLiquidity'
import { useCallback } from 'react'
import { Address, zeroAddress, type Hex } from 'viem'
import { useAccount } from 'wagmi'
import { useCheckShouldSwitchNetwork } from './useCheckShouldSwitchNetwork'

interface InfinityCollectFeeAction {
  attemptingTx: boolean
  onCollect: (params: CollectFeeProps) => Promise<void>
}

type CollectFeeProps = {
  tokenId: bigint
  poolKey: PoolKey
  wrapAddress?: Address
}

const useInfinityCollectFeeAction = ({
  chainId,
  onDone,
}: {
  chainId: number | undefined
  onDone?: (hash: Hex) => void
}): InfinityCollectFeeAction => {
  const { address: account } = useAccount()
  const { switchNetworkIfNecessary, isLoading: isSwitchingNetwork } = useCheckShouldSwitchNetwork()

  const { removeLiquidity: removeCLLiquidity, attemptingTx } = useRemoveClLiquidity(chainId, account, onDone)

  const onCollectFee = useCallback(
    async ({ tokenId, poolKey, wrapAddress }: CollectFeeProps) => {
      if (!chainId) return
      const shouldSwitch = await switchNetworkIfNecessary(chainId)
      if (!shouldSwitch) {
        await removeCLLiquidity({
          tokenId,
          poolKey,
          liquidity: 0n,
          amount0Min: 0n,
          amount1Min: 0n,
          wrapAddress: wrapAddress ?? zeroAddress,
          deadline: BigInt(Math.floor(Date.now() / 1000) + 60 * 20),
        })
      }
    },
    [switchNetworkIfNecessary, removeCLLiquidity, chainId],
  )

  return {
    attemptingTx: attemptingTx || isSwitchingNetwork,
    onCollect: onCollectFee,
  }
}

export default useInfinityCollectFeeAction
