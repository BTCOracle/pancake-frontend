import { useEffect, ReactNode } from 'react'
import { useTranslation } from '@pancakeswap/localization'
import { SignatureResult, Context, VersionedTransaction, Transaction } from '@solana/web3.js'
import { Flex, Box } from '@chakra-ui/react'
import { ApiV3Token, TxVersion } from '@pancakeswap/solana-core-sdk'
import { Subject } from 'rxjs'

import { useAppStore } from '@/store/useAppStore'
import ExternalLink from '@/icons/misc/ExternalLink'
import { setTxRecord } from '@/utils/tx/historyTxStatus'

import { colors } from '@/theme/cssVariables/colors'
import { ToastStatus } from '@/types/tx'
import { isSwapSlippageError } from '@/utils/tx/swapError'
import { useTokenAccountStore } from '@/store'
import retryTx, { cancelRetryTx } from './retryTx'
import { toastSubject } from './useGlobalToast'

export interface TxMeta {
  title?: string | ReactNode
  description?: string | ReactNode
  txHistoryTitle?: string | ReactNode
  txHistoryDesc?: string | ReactNode
  txValues?: Record<string, any>
}

export type onConfirmed = (args?: { txId?: string; signatureResult?: SignatureResult; context?: Context }) => void

export const txStatusSubject = new Subject<
  TxMeta & {
    txId: string
    status?: ToastStatus
    txValues?: Record<string, any>
    mintInfo?: ApiV3Token[]
    hideResultToast?: boolean
    update?: boolean
    skipWatchSignature?: boolean
    duration?: number
    isSwap?: boolean
    signedTx?: Transaction | VersionedTransaction
    onConfirmed?: onConfirmed
    onError?: (signatureResult: SignatureResult, context: Context) => void
    onSent?: () => void
    onClose?: () => void
  }
>()

export const multiTxStatusSubject = new Subject<
  TxMeta & {
    toastId: string
    status?: ToastStatus
    update?: boolean
    subTxIds: (TxMeta & { txId: string; status?: ToastStatus; signedTx?: Transaction | VersionedTransaction })[]
    txValues?: Record<string, any>
    mintInfo?: ApiV3Token[]
    duration?: number
    skipWatchSignature?: boolean
    isSwap?: boolean
    onError?: (signatureResult: SignatureResult, context: Context) => void
    onSent?: () => void
    onClose?: () => void
  }
>()

export const TOAST_DURATION = 2 * 60 * 1000
const LOOP_TX_STATUS_INTERVAL = 2000
const subscribeMap = new Map<string, any>()
const txStatus: Record<string, ToastStatus> = {}

function useTxStatus() {
  const { t } = useTranslation()
  const connection = useAppStore((s) => s.connection)
  const explorerUrl = useAppStore((s) => s.explorerUrl)

  useEffect(() => {
    if (!connection) return
    const sub = txStatusSubject
      .asObservable()
      .subscribe(
        ({
          txId,
          status,
          title,
          txHistoryTitle,
          description,
          txHistoryDesc = '',
          txValues,
          mintInfo = [],
          hideResultToast,
          update,
          skipWatchSignature,
          signedTx,
          duration,
          isSwap,
          onConfirmed,
          onError,
          onSent,
          onClose
        }) => {
          const owner = useAppStore.getState().publicKey?.toBase58()
          const isMultisigWallet = useAppStore.getState().wallet?.adapter.name === 'SquadsX'

          const renderDetail = (status = '') => {
            if (isMultisigWallet) return null
            return (
              <Flex
                gap="1"
                alignItems="center"
                onClick={() => window.open(`${explorerUrl}/tx/${txId}`)}
                cursor="pointer"
                opacity={status ? 1 : 0.8}
              >
                {t('View transaction details')}
                <ExternalLink cursor="pointer" color={status ? colors.primary60 : colors.secondary} />
              </Flex>
            )
          }

          // show initial tx send toast
          toastSubject.next({
            id: txId,
            title: title || `${t('Transaction')} ${t('Sent')}`,
            description: isMultisigWallet ? (
              <>
                {description} {t('Transaction initiation')}
              </>
            ) : (
              description || `${explorerUrl}/tx/${txId}`
            ),
            detail: renderDetail(),
            status: status || 'info',
            duration: duration ?? TOAST_DURATION,
            update,
            onClose
          })
          onSent?.()

          setTxRecord({
            status: status || 'info',
            title: txHistoryTitle || t('Transaction'),
            description: txHistoryDesc || '',
            txId,
            owner,
            mintInfo,
            txValues,
            isMultiSig: isMultisigWallet
          })

          if (subscribeMap.has(txId)) return
          if (!txId || skipWatchSignature) return

          let isTxOnChain = false
          let timeout = 0
          let intervalId = 0
          let intervalCount = 0

          const cbk = (signatureResult: SignatureResult, context: Context) => {
            isTxOnChain = true
            window.clearInterval(intervalId)
            cancelRetryTx(txId)
            clearTimeout(timeout)
            subscribeMap.delete(txId)
            if (signatureResult.err) {
              onError?.(signatureResult, context)
              // update toast status to error
              if (hideResultToast) return
              const isSlippageError = isSwap && isSwapSlippageError(signatureResult)

              toastSubject.next({
                id: txId,
                update: true,
                title: isSlippageError
                  ? t('Swap failed due to slippage error!')
                  : `${
                      isMultisigWallet ? (
                        <>
                          {title} {t('Transaction initiation')}
                        </>
                      ) : (
                        title
                      )
                    } ${t('Failed')}`,
                status: 'error',
                description: isSlippageError
                  ? t('Slippage has exceeded user settings. Try again or adjust your slippage tolerance.')
                  : description || `${explorerUrl}/tx/${txId}`,
                detail: renderDetail('error'),
                onClose
              })

              setTxRecord({
                status: 'error',
                title: txHistoryTitle || 'transaction.title',
                description: txHistoryDesc || '',
                txId,
                owner,
                mintInfo,
                txValues,
                isMultiSig: isMultisigWallet
              })
            } else {
              onConfirmed?.({
                txId,
                signatureResult,
                context
              })
              if (hideResultToast) return
              // update toast status to success
              toastSubject.next({
                id: txId,
                update: true,
                title: isMultisigWallet ? t('Transaction initiated.') : title || `${t('Transaction')} ${t('Confirmed')}`,
                description: isMultisigWallet
                  ? t('You can now cast votes for this proposal on the Squads app.')
                  : description || `${explorerUrl}/tx/${txId}`,
                detail: renderDetail('success'),
                status: 'success',
                onClose
              })

              setTxRecord({
                status: 'success',
                title: txHistoryTitle || 'transaction.title',
                description: txHistoryDesc || '',
                txId,
                owner,
                mintInfo,
                txValues,
                isMultiSig: isMultisigWallet
              })
            }
          }

          const subId = connection.onSignature(txId, cbk, 'confirmed')
          subscribeMap.set(txId, subId)
          connection.getSignatureStatuses([txId])

          intervalId = window.setInterval(async () => {
            if (intervalCount++ > TOAST_DURATION / LOOP_TX_STATUS_INTERVAL || isTxOnChain) {
              window.clearInterval(intervalId)
              return
            }
            try {
              const r = await connection.getTransaction(txId, { commitment: 'confirmed', maxSupportedTransactionVersion: TxVersion.V0 })
              if (r) {
                console.log('tx status from getTransaction')
                cbk({ err: r.meta?.err || null }, { slot: r.slot })
                window.clearInterval(intervalId)
                useTokenAccountStore.getState().fetchTokenAccountAct({ commitment: useAppStore.getState().commitment })
              }
            } catch (e) {
              console.error('getTransaction timeout:', e)
              window.clearInterval(intervalId)
            }
          }, LOOP_TX_STATUS_INTERVAL)

          if (signedTx) retryTx({ id: txId, tx: signedTx })

          // prepare for tx timeout
          timeout = window.setTimeout(() => {
            if (isTxOnChain) return
            toastSubject.next({
              id: txId,
              close: true
            })
            cancelRetryTx(txId)
            connection.removeSignatureListener(subId)
            toastSubject.next({
              title: t('Something went wrong. Request timed out'),
              description,
              status: 'warning',
              duration: 8 * 1000,
              onClose
            })
            // eslint-disable-next-line
            // @ts-ignore
            onError?.()
          }, TOAST_DURATION)
        }
      )

    return () => {
      sub?.unsubscribe()
    }
  }, [connection])

  useEffect(() => {
    if (!connection) return
    const sub = multiTxStatusSubject
      .asObservable()
      .subscribe(
        ({
          toastId,
          subTxIds,
          status,
          title,
          txHistoryTitle,
          description,
          txHistoryDesc = '',
          txValues,
          mintInfo = [],
          update,
          duration,
          skipWatchSignature,
          isSwap,
          onError,
          onSent,
          onClose
        }) => {
          const owner = useAppStore.getState().publicKey?.toBase58()
          const isMultisigWallet = useAppStore.getState().wallet?.adapter.name === 'SquadsX'

          subTxIds.forEach((tx) => {
            if (tx.status) txStatus[tx.txId] = tx.status
          })

          const openAllTxDetails = () => {
            subTxIds.forEach(({ txId }) => {
              if (txId) window.open(`${explorerUrl}/tx/${txId}`)
            })
          }

          const renderDetail = () => {
            return (
              <>
                <Box>
                  {subTxIds.length} {t('Transaction')} {t('Sent')}
                </Box>
                <Box>
                  <Flex gap="1" alignItems="center" onClick={openAllTxDetails} cursor="pointer" opacity={1}>
                    {t('View transaction details')}
                    <ExternalLink cursor="pointer" color={colors.primary60} />
                  </Flex>
                </Box>
              </>
            )
          }

          // show initial tx send toast
          toastSubject.next({
            id: toastId,
            update,
            title: title || `${t('Transaction')} ${t('Sent')}`,
            description,
            detail: renderDetail(),
            status: status || 'info',
            duration: duration || TOAST_DURATION,
            onClose
          })

          setTxRecord({
            status: status || 'info',
            title: txHistoryTitle || `${t('Transaction')} ${t('Sent')}`,
            description: txHistoryDesc,
            txId: toastId,
            owner,
            mintInfo,
            txValues,
            subTx: subTxIds.map(({ txId, txHistoryTitle, status }) => ({
              txId,
              name: txHistoryTitle || '',
              status: status ?? 'info',
              date: Date.now()
            })),
            isMultiSig: isMultisigWallet
          })

          // prepare for tx timeout
          const isTxOnChain = status === 'success' || status === 'error'
          if (!subscribeMap.has(toastId)) {
            // adjust timeout based on the number of subTxIds
            const adjustedTimeout = TOAST_DURATION + subTxIds.length * 2000
            window.setTimeout(() => {
              if (subscribeMap.get(toastId) !== true) {
                toastSubject.next({
                  id: toastId,
                  close: true
                })
                subTxIds.forEach(({ txId }) => cancelRetryTx(txId))
                toastSubject.next({
                  title: t('Something went wrong. Request timed out'),
                  detail: renderDetail(),
                  status: 'warning',
                  duration: 5 * 1000,
                  onClose
                })
              }
              subscribeMap.delete(toastId)
            }, adjustedTimeout)
          }
          subscribeMap.set(toastId, isTxOnChain)

          if (!skipWatchSignature) {
            subTxIds.forEach(({ txId, signedTx }) => {
              if (subscribeMap.has(txId)) return

              let intervalId = 0
              let intervalCount = 0

              const cbk = (signatureResult: SignatureResult, context: Context) => {
                txStatus[txId] = signatureResult.err ? 'error' : 'success'
                window.clearInterval(intervalId)
                cancelRetryTx(txId)
                subscribeMap.delete(txId)
                if (signatureResult.err) {
                  subscribeMap.set(toastId, true)
                  const isSlippageError = isSwap && isSwapSlippageError(signatureResult)

                  toastSubject.next({
                    id: toastId,
                    update: true,
                    title: isSlippageError
                      ? t('Swap failed due to slippage error!')
                      : (isMultisigWallet ? (
                          <>
                            {title} {t('Transaction initiation')}
                          </>
                        ) : (
                          title || t('Transaction')
                        )) + t('Failed'),
                    status: 'error',
                    description: isSlippageError
                      ? t('Slippage has exceeded user settings. Try again or adjust your slippage tolerance.')
                      : description,
                    detail: renderDetail(),
                    onClose
                  })

                  onError?.(signatureResult, context)
                  setTxRecord({
                    status: 'error',
                    title: txHistoryTitle || 'transaction.failed',
                    description: txHistoryDesc,
                    txId: toastId,
                    owner,
                    mintInfo,
                    txValues,
                    subTx: subTxIds.map(({ txId: tx, txHistoryTitle }) => ({
                      txId: tx,
                      name: txHistoryTitle || '',
                      status: txId === tx ? 'error' : 'success',
                      date: Date.now()
                    })),
                    isMultiSig: isMultisigWallet
                  })
                } else {
                  const allTxStatus = Object.values(txStatus)
                  const isAllSent = allTxStatus.length === subTxIds.length
                  const isAllSuccess = isAllSent && allTxStatus.filter((s) => s === 'success').length === subTxIds.length
                  subscribeMap.set(toastId, isAllSuccess)
                  // update toast status to success
                  toastSubject.next({
                    id: toastId,
                    update: true,
                    title: isMultisigWallet
                      ? t('Transaction initiated.')
                      : title
                      ? `${title} ${t('Confirmed')}`
                      : `${t('Transaction')} ${t('Confirmed')}`,
                    description,
                    detail: renderDetail(),
                    status: isAllSuccess ? 'success' : 'info',
                    onClose
                  })

                  if (isAllSent) onSent?.()

                  setTxRecord({
                    status: isAllSuccess ? 'success' : 'info',
                    title: txHistoryTitle || 'transaction.failed',
                    description: txHistoryDesc,
                    txId: toastId,
                    owner,
                    mintInfo,
                    txValues,
                    subTx: subTxIds.map(({ txId: tx, txHistoryTitle }) => ({
                      txId: tx,
                      name: txHistoryTitle || '',
                      status: 'success',
                      date: Date.now()
                    })),
                    isMultiSig: isMultisigWallet
                  })
                }
              }

              const subId = connection.onSignature(txId, cbk, 'confirmed')
              subscribeMap.set(txId, subId)
              connection.getSignatureStatuses([txId])

              intervalId = window.setInterval(async () => {
                if (intervalCount++ > TOAST_DURATION / LOOP_TX_STATUS_INTERVAL || txStatus[txId]) {
                  window.clearInterval(intervalId)
                  return
                }
                try {
                  const r = await connection.getTransaction(txId, { commitment: 'confirmed', maxSupportedTransactionVersion: TxVersion.V0 })
                  if (r) {
                    console.log('tx status from getTransaction:', txId)
                    cbk({ err: r.meta?.err || null }, { slot: r.slot })
                    window.clearInterval(intervalId)
                    useTokenAccountStore.getState().fetchTokenAccountAct({ commitment: useAppStore.getState().commitment })
                  }
                } catch (e) {
                  console.error('getTransaction timeout:', e, txId)
                  window.clearInterval(intervalId)
                }
              }, LOOP_TX_STATUS_INTERVAL)

              if (signedTx) retryTx({ tx: signedTx, id: txId })
            })
          }
        }
      )

    return () => {
      sub?.unsubscribe()
    }
  }, [connection])
}

export default useTxStatus
