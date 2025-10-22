import { useTranslation } from '@pancakeswap/localization'
import { CurrencyAmount, NativeCurrency, Token } from '@pancakeswap/swap-sdk-core'
import { useToast } from '@pancakeswap/uikit'
import { useQueryClient } from '@tanstack/react-query'
import { ToastDescriptionWithTx } from 'components/Toast'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { logGTMGiftCreateSuccessEvent } from 'utils/customGTMEventTracking'
import { isUserRejected } from 'utils/sentry'
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import { PancakeGiftV1Abi } from '../abis/PancakeGiftV1Abi'
import { GIFT_PANCAKE_V1_ADDRESS, QUERY_KEY_GIFT_INFO } from '../constants'
import { useSendGiftContext } from '../providers/SendGiftProvider'
import { convertCodeHash } from '../utils/convertCodeHash'
import { generateCreateGiftParams } from '../utils/generateCreateGiftParams'
import { useCalculateTotalCostCreateGift } from './useCalculateTotalCostCreateGift'
import { useReadGasPayment } from './useReadGasPayment'

export const useCreateGift = ({
  tokenAmount,
  nativeAmount,
}: {
  tokenAmount?: CurrencyAmount<Token | NativeCurrency>
  nativeAmount?: CurrencyAmount<NativeCurrency>
}) => {
  const { t } = useTranslation()
  const { chainId } = useActiveChainId()
  const [error, setError] = useState<Error | null>(null)
  const { toastSuccess, toastError } = useToast()
  const { includeStarterGas } = useSendGiftContext()

  const { address: account } = useAccount()

  const { writeContractAsync, data: txHash, isPending } = useWriteContract()
  const queryClient = useQueryClient()

  const totalUsd = useCalculateTotalCostCreateGift({ tokenAmount, nativeAmount })

  // Get GAS_PAYMENT from contract
  const gasPayment = useReadGasPayment()

  const createGift = useCallback(
    async ({ code }: { code: string }) => {
      if (!tokenAmount) {
        setError(new Error('Amount is not found'))
        return
      }

      if (!gasPayment) {
        setError(new Error('Gas payment not found'))
        return
      }

      const codeHash = convertCodeHash(code)

      if (!codeHash) {
        setError(new Error('Code is invalid'))
        return
      }

      // Calculate transaction value: nativeAmount + GAS_PAYMENT
      const gasPaymentBigInt = BigInt(gasPayment.toString())

      const { tokenAddress, tokenAmountBigInt, nativeAmountBigInt, transactionValue } = generateCreateGiftParams({
        tokenAmount,
        nativeAmount,
        gasPaymentBigInt,
      })

      writeContractAsync(
        {
          address: GIFT_PANCAKE_V1_ADDRESS,
          abi: PancakeGiftV1Abi,
          functionName: 'createGift',
          args: [codeHash, tokenAddress, tokenAmountBigInt, nativeAmountBigInt],
          value: transactionValue,
        },
        {
          onSuccess: () => {
            // Track gift creation success with USD amount
            logGTMGiftCreateSuccessEvent(chainId, totalUsd.toString(), includeStarterGas ? 'link' : 'qr')
          },
          onError: (error) => {
            if (isUserRejected(error)) {
              return
            }

            toastError(t('Create Gift Error'), error.message)

            setError(new Error('Failed to create gift'))
          },
        },
      )
    },
    [
      gasPayment,
      t,
      writeContractAsync,
      toastSuccess,
      queryClient,
      chainId,
      account,
      includeStarterGas,
      tokenAmount,
      nativeAmount,
    ],
  )

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    isError: isErrorConfirming,
    error: errorConfirming,
  } = useWaitForTransactionReceipt({
    hash: txHash,
  })

  useEffect(() => {
    if (isConfirmed && txHash) {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY_GIFT_INFO, chainId, account] })
    }
  }, [isConfirmed, txHash])

  useEffect(() => {
    if (isErrorConfirming && errorConfirming && txHash) {
      const reason = errorConfirming?.message?.split('\n').find((line) => line.includes('Details'))

      toastError(t(`Create Gift Error ${reason}`), <ToastDescriptionWithTx bscTrace txHash={txHash} />)
    }
  }, [isErrorConfirming, errorConfirming, txHash])

  useEffect(() => {
    if (isConfirmed && txHash) {
      toastSuccess(t('Create Gift Successfully'), <ToastDescriptionWithTx bscTrace txHash={txHash} />)
    }
  }, [isConfirmed, txHash])

  return useMemo(
    () => ({
      isErrorConfirming,
      errorConfirming,
      createGift,
      isLoading: isPending || isConfirming,
      error,
      txHash,
      isConfirmed,
    }),
    [createGift, isPending, isConfirming, txHash, error, isConfirmed, isErrorConfirming, errorConfirming],
  )
}
