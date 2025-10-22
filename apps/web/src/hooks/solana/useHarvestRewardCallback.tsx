import { useCallback } from 'react'
import { SolanaV3PositionDetail } from 'state/farmsV4/state/accountPositions/type'
import BN from 'bn.js'
import { SolanaV3Pool } from 'state/pools/solana'
import { useRemoveLiquidityCallback } from './useRemoveLiquidityCallback'

export type HarvestRewardCallbackProps = {
  params: {
    poolInfo: SolanaV3Pool
    position: SolanaV3PositionDetail
  }
  onSent?: (txId: string) => void
  onError?: (error: any) => void
  onFinally?: () => void
  onConfirmed?: () => void
}

const ZERO = new BN(0)

export const useHarvestRewardCallback = () => {
  const removeLiquidity = useRemoveLiquidityCallback()

  return useCallback(
    async ({ params, onSent, onError, onFinally, onConfirmed }: HarvestRewardCallbackProps) => {
      const { poolInfo, position } = params

      return removeLiquidity({
        params: {
          poolInfo,
          position,
          liquidity: ZERO,
          amountA: ZERO.toString(),
          amountB: ZERO.toString(),
          closePosition: false,
        },
        harvest: true,
        onSent,
        onError,
        onFinally,
        onConfirmed,
      })
    },
    [removeLiquidity],
  )
}
