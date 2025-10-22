/*
function cancelGift(bytes32 codeHash) external nonReentrant;
*/

import { useTranslation } from '@pancakeswap/localization'
import { useToast } from '@pancakeswap/uikit'
import { ToastDescriptionWithTx } from 'components/Toast'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { useCallback, useMemo, useState } from 'react'
import { useWriteContract } from 'wagmi'
import { PancakeGiftV1Abi } from '../abis/PancakeGiftV1Abi'
import { GIFT_PANCAKE_V1_ADDRESS } from '../constants'

interface CancelGiftParams {
  codeHash: string
}

export const useCancelGift = () => {
  const { t } = useTranslation()
  const { chainId } = useActiveChainId()
  const [error, setError] = useState<Error | null>(null)
  const { toastSuccess } = useToast()

  const { writeContractAsync, data: txHash, isPending } = useWriteContract()

  const cancelGift = useCallback(
    async ({ codeHash }: CancelGiftParams) => {
      try {
        setError(null)

        await writeContractAsync(
          {
            address: GIFT_PANCAKE_V1_ADDRESS,
            abi: PancakeGiftV1Abi,
            functionName: 'cancelGift',
            args: [codeHash],
            chainId,
          },
          {
            onSuccess: (transactionHash) => {
              if (transactionHash) {
                toastSuccess(
                  t('Cancel Gift Successfully'),
                  <ToastDescriptionWithTx bscTrace txHash={transactionHash} />,
                )
              }
            },
            onError: (err) => {
              setError(err)
            },
          },
        )
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error occurred'))
      }
    },
    [t, writeContractAsync, toastSuccess, chainId],
  )

  return useMemo(
    () => ({
      cancelGift,
      isLoading: isPending,
      error,
      txHash,
    }),
    [cancelGift, isPending, txHash, error],
  )
}
