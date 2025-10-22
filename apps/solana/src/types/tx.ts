import { onConfirmed } from '@/hooks/toast/useTxStatus'

export interface TxCallbackProps<O = any> {
  onSent?: (props?: O) => void
  onError?: (e?: any) => void
  onFinally?: (props?: O) => void
  onConfirmed?: onConfirmed
}

export interface TxCallbackPropsGeneric<O> {
  onSent?: (props: O) => void
  onError?: () => void
  onFinally?: (props: O) => void
  onConfirmed?: () => void
}

export type ToastStatus = 'success' | 'error' | 'info' | 'warning'
