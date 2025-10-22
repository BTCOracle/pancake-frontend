import { SolanaV3PositionDetail } from 'state/farmsV4/state/accountPositions/type'
import { useSolanaUserSlippage } from '@pancakeswap/utils/user'
import { useCallback } from 'react'
import { SolanaV3Pool } from 'state/pools/solana'
import BN from 'bn.js'
import BigNumber from 'bignumber.js'
import { TxVersion } from '@pancakeswap/solana-core-sdk'
import { useSolanaPriorityFee } from 'components/WalletModalV2/hooks/useSolanaPriorityFee'
import { useTranslation } from '@pancakeswap/localization'
import { formatNumber } from '@pancakeswap/utils/formatBalance'
import useSolanaTxError from '../../components/WalletModalV2/hooks/useSolanaTxError'
import { useRaydium } from './useRaydium'

export type AddLiquidityCallbackProps = {
  params: {
    poolInfo: SolanaV3Pool
    position: SolanaV3PositionDetail
    liquidity: BN
    amountMaxA: string
    amountMaxB: string
  }
  onSent: (txId: string) => void
  onError: (error: any) => void
  onFinally?: () => void
  onConfirmed?: () => void
}

export const useAddLiquidityCallback = () => {
  const raydium = useRaydium()
  const { t } = useTranslation()
  const { computeBudgetConfig } = useSolanaPriorityFee()
  const { executeSolanaTransaction, handleSolanaError } = useSolanaTxError()

  return useCallback(
    async ({ params, onSent, onError, onFinally, onConfirmed }: AddLiquidityCallbackProps) => {
      const { poolInfo, position, liquidity, amountMaxA, amountMaxB } = params
      if (!raydium || !position) return

      const [_amountMaxA, _amountMaxB] = [
        new BN(new BigNumber(amountMaxA).multipliedBy(10 ** poolInfo.mintA.decimals).toFixed(0)),
        new BN(new BigNumber(amountMaxB).multipliedBy(10 ** poolInfo.mintB.decimals).toFixed(0)),
      ]

      const { execute } = await raydium.clmm.increasePositionFromLiquidity({
        poolInfo,
        poolKeys: raydium.clmm.getClmmKeysFromPoolInfo(poolInfo),
        ownerPosition: position,
        ownerInfo: {
          useSOLBalance: true,
        },
        liquidity,
        amountMaxA: _amountMaxA,
        amountMaxB: _amountMaxB,
        checkCreateATAOwner: true,
        computeBudgetConfig,
        txVersion: TxVersion.V0,
      })
      const executeAdd = async () => {
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
        const amountA = formatNumber(Number(amountMaxA))
        const amountB = formatNumber(Number(amountMaxB))
        return {
          summary: `Add ${amountA} ${poolInfo.mintA.symbol} and ${amountB} ${poolInfo.mintB.symbol}`,
          type: 'increase-liquidity-v3' as const,
          translatableSummary: {
            text: 'Add %amountA% %tokenASymbol% and %amountB% %tokenBSymbol%',
            data: { amountA, tokenASymbol: poolInfo.mintA.symbol, amountB, tokenBSymbol: poolInfo.mintB.symbol },
          },
        }
      }

      // eslint-disable-next-line consistent-return
      return executeSolanaTransaction(executeAdd, executeMeta)
    },
    [raydium, computeBudgetConfig, executeSolanaTransaction, handleSolanaError],
  )
}
