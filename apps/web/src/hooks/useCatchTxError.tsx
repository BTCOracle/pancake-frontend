import { TranslateFunction, useTranslation } from '@pancakeswap/localization'
import { useToast } from '@pancakeswap/uikit'
import { ToastDescriptionWithTx } from 'components/Toast'
import { useCallback, useState } from 'react'
import { getViemErrorMessage, parseViemError } from 'utils/errors'
import { isUserRejected, logError } from 'utils/sentry'
import { Address, Hash } from 'viem'
import { ToastData } from '@pancakeswap/uikit/components/Toast'
import { usePublicNodeWaitForTransaction } from './usePublicNodeWaitForTransaction'

const notPreview = process.env.NEXT_PUBLIC_VERCEL_ENV !== 'preview'

type Params = {
  throwUserRejectError?: boolean
  throwCustomError?: () => void
}

const enhanceReason = (reason: string | undefined, t: TranslateFunction): string | undefined => {
  if (!reason) return reason

  let enhanced = reason
  const lower = reason.toLowerCase()

  if (lower.includes('contract not allowed')) {
    enhanced += `\n${t('Smart Wallets are not supported, please create a ticket on our Official Discord')}`
  }
  return enhanced
}

export default function useCatchTxError(params?: Params) {
  const { throwUserRejectError = false, throwCustomError } = params || {}
  const { t } = useTranslation()
  const { toastError, toastSuccess } = useToast()
  const [loading, setLoading] = useState(false)
  const { waitForTransaction } = usePublicNodeWaitForTransaction()
  const [txResponseLoading, setTxResponseLoading] = useState(false)

  const handleNormalError = useCallback(
    (error) => {
      logError(error)
      const err = parseViemError(error)
      if (err) {
        const reason = enhanceReason(notPreview ? err.shortMessage || err.message : err.message, t)
        toastError(
          t('Error'),
          t('Transaction failed with error: %reason%', {
            reason,
          }),
        )
      } else {
        toastError(t('Error'), t('Please try again. Confirm the transaction and make sure you are paying enough gas!'))
      }
    },
    [t, toastError],
  )

  const handleTxError = useCallback(
    (error, hash) => {
      logError(error)
      const err = parseViemError(error)
      toastError(
        t('Failed'),
        <ToastDescriptionWithTx txHash={hash}>
          {err
            ? t('Transaction failed with error: %reason%', {
                reason: notPreview ? getViemErrorMessage(err) : err.message,
              })
            : t('Transaction failed. For detailed error message:')}
        </ToastDescriptionWithTx>,
      )
    },
    [t, toastError],
  )

  const fetchWithCatchTxError = useCallback(
    async (
      callTx: () => Promise<{ hash: Address } | Hash | undefined>,
      options: { toastSuccess: { title: ToastData['title'] } } = {
        toastSuccess: {
          title: `${t('Transaction Submitted')}!`,
        },
      },
    ) => {
      let tx: { hash: Address } | Hash | null | undefined = null

      try {
        setLoading(true)

        tx = await callTx()
        if (!tx) {
          return null
        }
        const hash = typeof tx === 'string' ? tx : tx.hash
        toastSuccess(
          options.toastSuccess.title || `${t('Transaction Submitted')}!`,
          <ToastDescriptionWithTx txHash={hash} />,
        )

        const receipt = await waitForTransaction({
          hash,
        })
        if (receipt?.status === 'success') {
          return receipt
        }
        throw Error(t('Failed'))
      } catch (error: any) {
        if (!isUserRejected(error)) {
          if (!tx) {
            handleNormalError(error)
          } else if (throwCustomError) {
            throwCustomError()
          } else {
            handleTxError(error, typeof tx === 'string' ? tx : tx.hash)
          }
        }
        if (throwUserRejectError) {
          throw error
        }
      } finally {
        setLoading(false)
      }

      return null
    },
    [toastSuccess, t, waitForTransaction, throwUserRejectError, throwCustomError, handleNormalError, handleTxError],
  )

  const fetchTxResponse = useCallback(
    async (callTx: () => Promise<{ hash: Address } | Hash | undefined>): Promise<{ hash: Address } | null> => {
      let tx: { hash: Address } | Hash | null | undefined = null

      try {
        setTxResponseLoading(true)

        tx = await callTx()

        if (!tx) return null

        const hash = typeof tx === 'string' ? tx : tx.hash

        toastSuccess(`${t('Transaction Submitted')}!`, <ToastDescriptionWithTx txHash={hash} />)

        return { hash }
      } catch (error: any) {
        if (!isUserRejected(error)) {
          if (!tx) {
            handleNormalError(error)
          } else {
            handleTxError(error, typeof tx === 'string' ? tx : tx.hash)
          }
        }
      } finally {
        setTxResponseLoading(false)
      }

      return null
    },
    [toastSuccess, t, handleNormalError, handleTxError],
  )

  return {
    fetchWithCatchTxError,
    fetchTxResponse,
    loading,
    txResponseLoading,
  }
}
