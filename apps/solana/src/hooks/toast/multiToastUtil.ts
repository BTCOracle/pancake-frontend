import { v4 as uuid } from 'uuid'
import { TranslateFunction } from '@pancakeswap/localization'
import { ReactNode } from 'react'
import { ToastStatus, TxCallbackProps } from '@/types/tx'
import { txStatusSubject, multiTxStatusSubject } from './useTxStatus'

const toastStatusSet = new Set<string>(['success', 'error', 'info'])
export type ProcessedId = { txId: string; status: ToastStatus }[]

export const generateDefaultIds = (length: number): ProcessedId => new Array(length).fill({ txId: '', status: 'info' })

export const getDefaultToastData = ({ txLength, ...txProps }: { txLength: number } & TxCallbackProps) => ({
  processedId: generateDefaultIds(txLength),
  toastId: uuid(),
  handler: callBackHandler({ transactionLength: txLength, ...txProps })
})

export const transformProcessData = ({
  data,
  processedId
}: {
  data: { txId: string; status: string }[]
  processedId: ProcessedId
}): ProcessedId =>
  processedId.map((prev, idx) => ({
    txId: data[idx]?.txId || prev.txId,
    status: !data[idx] || !toastStatusSet.has(data[idx].status) ? 'info' : (data[idx].status as ToastStatus)
  }))

export const handleMultiTxToast = (
  props: {
    toastId: string
    processedId: ProcessedId
    txLength: number
    t: TranslateFunction
    meta: {
      title: string | ReactNode
      description: string | ReactNode
      txHistoryTitle: string | ReactNode
      txHistoryDesc: string | ReactNode
      txValues: Record<string, unknown>
    }
    skipWatchSignature?: boolean
    isSwap?: boolean
    getSubTxTitle: (idx: number) => string | ReactNode
    handler: (
      processedId: {
        txId: string
        status: ToastStatus
      }[]
    ) => void
    onCloseToast?: () => void
  } & TxCallbackProps
) => {
  const { t, toastId, txLength, processedId, meta, skipWatchSignature, isSwap, getSubTxTitle, handler, ...txProps } = props
  if (txLength <= 1) {
    if (processedId[0].txId) {
      txStatusSubject.next({
        status: processedId[0].status,
        skipWatchSignature,
        txId: processedId[0].txId,
        update: true,
        isSwap,
        ...meta,
        onSent: txProps.onSent,
        onError: txProps.onError,
        onConfirmed: txProps.onConfirmed,
        onClose: txProps.onCloseToast
      })
      handler(processedId)
    }
    return
  }

  const isError = processedId.some((t) => t.status === 'error')
  const isSuccess = processedId.filter((s) => s.status === 'success').length >= (props.txLength ?? props.processedId.length)
  multiTxStatusSubject.next({
    toastId,
    skipWatchSignature: true,
    update: true,
    status: isError ? 'error' : isSuccess ? 'success' : 'info',
    ...meta,
    isSwap,
    title: meta.title + (isError && !isSwap ? ` ${t('Failed')}` : ''),
    duration: isError || isSuccess ? 8000 : undefined,
    subTxIds: processedId.map((tx, idx) => {
      const titleKey = getSubTxTitle(idx)
      return {
        txId: tx.txId,
        status: tx.status,
        title: typeof titleKey === 'string' ? t(titleKey) : titleKey,
        txHistoryTitle: titleKey
      }
    })
  })
  handler(processedId)
}

export default function showMultiToast({
  t,
  toastId,
  processedId,
  meta,
  getSubTxTitle,
  txLength,
  onClose
}: {
  t: TranslateFunction
  toastId: string
  processedId: {
    txId: string
    status: ToastStatus
  }[]
  meta: {
    title: string
    description: JSX.Element
    txHistoryTitle: string
    txHistoryDesc: string
    txValues: Record<string, unknown>
  }
  getSubTxTitle: (idx: number) => string
  txLength?: number
  onClose?: () => void
}) {
  const isError = processedId.some((t) => t.status === 'error')
  const isSuccess = processedId.filter((s) => s.status === 'success').length >= (txLength ?? processedId.length)

  multiTxStatusSubject.next({
    toastId,
    skipWatchSignature: true,
    update: true,
    status: isError ? 'error' : isSuccess ? 'success' : 'info',
    ...meta,
    title: meta.title + (isError ? ` ${t('Failed')}` : ''),
    duration: isError || isSuccess ? 8000 : undefined,
    onClose,
    subTxIds: processedId.map((tx, idx) => {
      const titleKey = getSubTxTitle(idx)
      return {
        txId: tx.txId,
        status: tx.status,
        title: t(titleKey),
        txHistoryTitle: titleKey
      }
    })
  })
}

export const callBackHandler = ({
  transactionLength,
  ...callbackProps
}: {
  transactionLength: number
} & TxCallbackProps) => {
  let [successCalled, errorCalled, finallyCalled, confirmedCalled] = [false, false, false, false]

  return (
    processedId: {
      txId: string
      status: ToastStatus
    }[]
  ) => {
    if (processedId.some((tx) => tx.status === 'error')) {
      if (!errorCalled) callbackProps?.onError?.()
      if (!finallyCalled) callbackProps?.onFinally?.()
      errorCalled = true
      finallyCalled = true
      return
    }

    if (processedId.length === transactionLength) {
      if (!successCalled) callbackProps?.onSent?.()
      if (!finallyCalled) callbackProps?.onFinally?.()
      successCalled = true
      finallyCalled = true
    }

    if (processedId.filter((d) => d.status === 'success').length === transactionLength) {
      if (!confirmedCalled) callbackProps?.onConfirmed?.()
      confirmedCalled = true
    }
  }
}
