import { SolanaV3PositionDetail } from 'state/farmsV4/state/accountPositions/type'
import { useSolanaUserSlippage } from '@pancakeswap/utils/user'
import { useCallback } from 'react'
import { SolanaV3Pool } from 'state/pools/solana'
import BN from 'bn.js'
import BigNumber from 'bignumber.js'
import { getTransferAmountFeeV2, TxVersion } from '@pancakeswap/solana-core-sdk'
import { useSolanaPriorityFee } from 'components/WalletModalV2/hooks/useSolanaPriorityFee'
import { formatNumber } from '@pancakeswap/utils/formatBalance'
import useSolanaTxError from '../../components/WalletModalV2/hooks/useSolanaTxError'
import { useSolanaEpochInfo } from './useSolanaEpochInfo'
import { useRaydium } from './useRaydium'

export type RemoveLiquidityCallbackProps = {
  params: {
    poolInfo: SolanaV3Pool
    position: SolanaV3PositionDetail
    liquidity: BN
    amountA: string
    amountB: string
    closePosition?: boolean
  }
  harvest?: boolean
  onSent?: (txId: string) => void
  onError?: (error: any) => void
  onFinally?: () => void
  onConfirmed?: () => void
}

export const useRemoveLiquidityCallback = () => {
  const raydium = useRaydium()
  const { data: epochInfo } = useSolanaEpochInfo()
  const { computeBudgetConfig } = useSolanaPriorityFee()
  const [slippage] = useSolanaUserSlippage()
  const { executeSolanaTransaction, handleSolanaError } = useSolanaTxError()

  return useCallback(
    async ({ params, harvest, onSent, onError, onFinally, onConfirmed }: RemoveLiquidityCallbackProps) => {
      const { poolInfo, position, liquidity, amountA, amountB, closePosition: _closePosition } = params
      if (!raydium || !position) return

      const [_amountMinA, _amountMinB] = [
        new BN(
          new BigNumber(amountA)
            .multipliedBy(10000 - slippage)
            .dividedBy(10000)
            .multipliedBy(10 ** poolInfo.mintA.decimals)
            .toFixed(0),
        ),
        new BN(
          new BigNumber(amountB)
            .multipliedBy(10000 - slippage)
            .dividedBy(10000)
            .multipliedBy(10 ** poolInfo.mintB.decimals)
            .toFixed(0),
        ),
      ]

      const closePosition = typeof _closePosition === 'boolean' ? _closePosition : position.liquidity.eq(liquidity)
      const { fee: feeA = new BN(0) } = getTransferAmountFeeV2(
        _amountMinA,
        poolInfo.mintA.extensions?.feeConfig,
        epochInfo!,
        false,
      )
      const { fee: feeB = new BN(0) } = getTransferAmountFeeV2(
        _amountMinB,
        poolInfo.mintB.extensions?.feeConfig,
        epochInfo!,
        false,
      )
      const { execute } = await raydium.clmm.decreaseLiquidity({
        poolInfo,
        poolKeys: raydium.clmm.getClmmKeysFromPoolInfo(poolInfo),
        ownerPosition: position,
        ownerInfo: {
          useSOLBalance: true,
          closePosition: !(harvest || !closePosition),
        },
        liquidity,
        amountMinA: _amountMinA.sub(feeA),
        amountMinB: _amountMinB.sub(feeB),
        computeBudgetConfig,
        txVersion: TxVersion.V0,
      })

      const executeRemove = async () => {
        try {
          const { txId, signedTx } = await execute()
          onSent?.(txId)
          return { hash: txId }
        } catch (e) {
          handleSolanaError(e)
          onError?.(e)
          return { hash: '' }
        } finally {
          onFinally?.()
        }
      }

      const executeMeta = () => {
        const amountA_ = formatNumber(Number(amountA))
        const amountB_ = formatNumber(Number(amountB))
        const action = harvest ? 'Harvest' : closePosition ? 'Remove and close' : 'Remove'
        return {
          summary: `${action} ${amountA_} ${poolInfo.mintA.symbol} and ${amountB_} ${poolInfo.mintB.symbol}`,
          type: harvest ? ('collect-fee' as const) : ('remove-liquidity-v3' as const),
          translatableSummary: {
            text: harvest
              ? 'Harvest %amountA% %tokenASymbol% and %amountB% %tokenBSymbol%'
              : closePosition
              ? 'Remove %amountA% %tokenASymbol% and %amountB% %tokenBSymbol% and close position'
              : 'Remove %amountA% %tokenASymbol% and %amountB% %tokenBSymbol%',
            data: {
              amountA: amountA_,
              tokenASymbol: poolInfo.mintA.symbol,
              amountB: amountB_,
              tokenBSymbol: poolInfo.mintB.symbol,
            },
          },
        }
      }

      // eslint-disable-next-line consistent-return
      return executeSolanaTransaction(executeRemove, executeMeta)
    },
    [raydium, computeBudgetConfig, executeSolanaTransaction, handleSolanaError, slippage, epochInfo],
  )
}
