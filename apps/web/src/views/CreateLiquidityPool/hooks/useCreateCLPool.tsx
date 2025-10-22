import { ChainId } from '@pancakeswap/chains'
import { encodePoolKey, PoolKey } from '@pancakeswap/infinity-sdk'
import { useTranslation } from '@pancakeswap/localization'
import { useToast } from '@pancakeswap/uikit'
import { ToastDescriptionWithTx } from 'components/Toast'
import useCatchTxError from 'hooks/useCatchTxError'
import { useInfinityCLPositionManagerContract } from 'hooks/useContract'
import { useCallback } from 'react'
import { Hex } from 'viem'

import { useAccount, useConfig } from 'wagmi'

export const useCreateInfinityCLPool = (targetChainId: ChainId, onDone?: () => void) => {
  const { t } = useTranslation()
  const { address: account, chainId } = useAccount()
  const { toastSuccess } = useToast()
  const infinityCLPositionManagerContract = useInfinityCLPositionManagerContract(targetChainId)
  const { fetchWithCatchTxError, loading: pendingTx } = useCatchTxError()
  const chainConfig = useConfig()
  const chain = chainConfig.chains[targetChainId]

  const createCLPool = useCallback(
    async (param: { poolKey: PoolKey<'CL'>; sqrtPriceX96: bigint; hookData?: Hex }) => {
      if (!account || targetChainId !== chainId || !infinityCLPositionManagerContract) {
        return
      }
      const receipt = await fetchWithCatchTxError(async () => {
        return infinityCLPositionManagerContract.write.initializePool(
          [encodePoolKey(param.poolKey), param?.sqrtPriceX96],
          {
            account,
            chain,
          },
        )
      })
      if (receipt?.status) {
        onDone?.()
        toastSuccess(
          `${t('Pool Created!')}`,
          <ToastDescriptionWithTx txHash={receipt.transactionHash}>
            {t('Infinity CL Pool Created')}
          </ToastDescriptionWithTx>,
        )
      }
    },
    [
      account,
      targetChainId,
      chainId,
      infinityCLPositionManagerContract,
      fetchWithCatchTxError,
      chain,
      onDone,
      toastSuccess,
      t,
    ],
  )

  return { createCLPool, pendingTx }
}
