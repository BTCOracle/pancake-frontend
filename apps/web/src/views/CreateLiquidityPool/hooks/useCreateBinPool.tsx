import { ChainId } from '@pancakeswap/chains'
import { encodePoolKey, getIsInitializedByPoolKey, PoolKey } from '@pancakeswap/infinity-sdk'
import { useTranslation } from '@pancakeswap/localization'
import { useToast } from '@pancakeswap/uikit'
import { ToastDescriptionWithTx } from 'components/Toast'
import useCatchTxError from 'hooks/useCatchTxError'
import { useInfinityBinPositionManagerContract } from 'hooks/useContract'
import { useCallback } from 'react'
import { getViemClients } from 'utils/viem'
import { Hex } from 'viem'

import { useAccount, useConfig } from 'wagmi'

export const useCreateInfinityBinPool = (
  targetChainId: ChainId,
  onDone?: () => void,
  onError?: (error: any) => void,
) => {
  const { t } = useTranslation()
  const { address: account, chainId } = useAccount()
  const { toastSuccess } = useToast()
  const binPositionManagerContract = useInfinityBinPositionManagerContract(targetChainId)
  const { fetchWithCatchTxError, loading: pendingTx } = useCatchTxError()
  const chainConfig = useConfig()
  const chain = chainConfig.chains[targetChainId]

  const createBinPool = useCallback(
    async (param: { poolKey: PoolKey<'Bin'>; activeId: number; hookData?: Hex }) => {
      if (!account || targetChainId !== chainId) {
        return
      }
      const publicClient = getViemClients({ chainId })
      // check if pool already exists
      const isInitialized = await getIsInitializedByPoolKey(publicClient, param.poolKey)
      if (isInitialized) {
        onError?.('Pool already exists')
        return
      }
      const receipt = await fetchWithCatchTxError(async () => {
        return binPositionManagerContract.write.initializePool([encodePoolKey(param.poolKey), param.activeId], {
          account,
          chain,
        })
      })
      if (receipt?.status) {
        onDone?.()
        toastSuccess(
          `${t('Pool created!')}`,
          <ToastDescriptionWithTx txHash={receipt.transactionHash}>
            {t('Infinity Bin Pool Created')}
          </ToastDescriptionWithTx>,
        )
      }
    },
    [
      account,
      targetChainId,
      chainId,
      fetchWithCatchTxError,
      onError,
      binPositionManagerContract.write,
      chain,
      onDone,
      toastSuccess,
      t,
    ],
  )

  return { createBinPool, pendingTx }
}
