import { ChainId } from '@pancakeswap/chains'
import { useTranslation } from '@pancakeswap/localization'
import { useMemo } from 'react'
import { calculateGasMargin } from 'utils'
import { isUserRejected } from 'utils/sentry'
import { transactionErrorToUserReadableMessage } from 'utils/transactionErrorToUserReadableMessage'
import {
  Address,
  Hex,
  SendTransactionReturnType,
  TransactionExecutionError,
  UserRejectedRequestError,
  hexToBigInt,
} from 'viem'
import { useSendTransaction } from 'wagmi'

import { ClassicOrder, OrderType } from '@pancakeswap/price-api-sdk'
import { usePaymaster } from 'hooks/usePaymaster'
import { logger } from 'utils/datadog'
import { InterfaceOrder } from 'views/Swap/utils'
import { viemClients } from 'utils/viem'
import useSwapRecordTransaction from './useSwapRecordTransaction'
import { isZero } from '../utils/isZero'

interface SwapCall {
  address: Address
  calldata: Hex
  value: Hex
}

interface WallchainSwapCall {
  getCall: () => Promise<SwapCall & { gas: string }>
}

interface SwapCallEstimate {
  call: SwapCall | WallchainSwapCall
}

interface SuccessfulCall extends SwapCallEstimate {
  call: SwapCall | WallchainSwapCall
  gasEstimate: bigint
}

interface FailedCall extends SwapCallEstimate {
  call: SwapCall | WallchainSwapCall
  error: Error
}

export class TransactionRejectedError extends Error {}

// returns a function that will execute a swap, if the parameters are all valid
export default function useSendSwapTransaction(
  account?: Address,
  chainId?: number,
  trade?: ClassicOrder['trade'] | null, // trade to execute, required
  swapCalls: SwapCall[] | WallchainSwapCall[] = [],
  type: 'V3SmartSwap' | 'UniversalRouter' = 'V3SmartSwap',
) {
  const { t } = useTranslation()
  const { sendTransactionAsync } = useSendTransaction()
  const publicClient = viemClients[chainId as ChainId]
  const addSwapTransaction = useSwapRecordTransaction(chainId, account)

  // Paymaster for zkSync
  const { isPaymasterAvailable, isPaymasterTokenActive, sendPaymasterTransaction } = usePaymaster()

  return useMemo(() => {
    if (!trade || !sendTransactionAsync || !account || !chainId || !publicClient) {
      return { callback: null }
    }
    return {
      callback: async function onSwap() {
        const estimatedCalls: SwapCallEstimate[] = await Promise.all(
          swapCalls.map((call) => {
            const { address, calldata, value } = call
            if ('getCall' in call) {
              // Only WallchainSwapCall, don't use rest of pipeline
              return {
                call,
                gasEstimate: undefined,
              }
            }
            const tx =
              !value || isZero(value)
                ? { account, to: address, data: calldata, value: 0n }
                : {
                    account,
                    to: address,
                    data: calldata,
                    value: hexToBigInt(value),
                  }
            return publicClient
              .estimateGas(tx)
              .then((gasEstimate) => {
                return {
                  call,
                  gasEstimate,
                }
              })
              .catch((gasError) => {
                console.debug('Gas estimate failed, trying to extract error', call, gasError)
                return { call, error: transactionErrorToUserReadableMessage(gasError, t) }
              })
          }),
        )

        // a successful estimation is a bignumber gas estimate and the next call is also a bignumber gas estimate
        let bestCallOption: SuccessfulCall | SwapCallEstimate | undefined = estimatedCalls.find(
          (el, ix, list): el is SuccessfulCall =>
            'gasEstimate' in el && (ix === list.length - 1 || 'gasEstimate' in list[ix + 1]),
        )

        // check if any calls errored with a recognizable error
        if (!bestCallOption) {
          const errorCalls = estimatedCalls.filter((call): call is FailedCall => 'error' in call)
          if (errorCalls.length > 0) throw errorCalls[errorCalls.length - 1].error
          const firstNoErrorCall = estimatedCalls.find<SwapCallEstimate>(
            (call): call is SwapCallEstimate => !('error' in call),
          )
          if (!firstNoErrorCall) throw new Error(t('Unexpected error. Could not estimate gas for the swap.'))
          bestCallOption = firstNoErrorCall
        }

        const call =
          'getCall' in bestCallOption.call
            ? await bestCallOption.call.getCall()
            : (bestCallOption.call as SwapCall & { gas?: string | bigint })

        if ('error' in call) {
          throw new Error('Route lost. Need to restart.')
        }

        if ('gas' in call && call.gas) {
          // prepared Wallchain's call have gas estimate inside
          call.gas = BigInt(call.gas)
        } else {
          call.gas =
            'gasEstimate' in bestCallOption && bestCallOption.gasEstimate
              ? calculateGasMargin(bestCallOption.gasEstimate, 2000n)
              : undefined
        }

        let sendTxResult: Promise<SendTransactionReturnType> | undefined

        if (isPaymasterAvailable && isPaymasterTokenActive) {
          sendTxResult = sendPaymasterTransaction(call, account)
        } else {
          sendTxResult = sendTransactionAsync({
            account,
            chainId,
            to: call.address,
            data: call.calldata,
            value: call.value && !isZero(call.value) ? hexToBigInt(call.value) : 0n,
            gas: call.gas,
          })
        }

        return sendTxResult
          .then((response) => {
            addSwapTransaction({
              order: { type: OrderType.PCS_CLASSIC, trade } as InterfaceOrder,
              hash: response,
              type,
            })
            return { hash: response }
          })
          .catch((error) => {
            // if the user rejected the tx, pass this along
            if (isUserRejected(error)) {
              throw new TransactionRejectedError(t('Transaction rejected'))
            } else {
              // otherwise, the error was unexpected and we need to convey that
              logger.warn(
                'Swap failed',
                {
                  chainId,
                  input: trade.inputAmount.currency,
                  output: trade.outputAmount.currency,
                  address: call.address,
                  value: call.value,
                  type,
                  target: 'AMM',
                  errorName: error?.name,
                  cause: error instanceof TransactionExecutionError ? error.cause : undefined,
                },
                error,
              )

              if (isPaymasterAvailable && isPaymasterTokenActive) {
                throw new Error(
                  `Swap failed: ${t('Try again with more gas token balance.')} ${transactionErrorToUserReadableMessage(
                    error,
                    t,
                  )}`,
                )
              }

              throw new Error(`Swap failed: ${transactionErrorToUserReadableMessage(error, t)}`)
            }
          })
      },
    }
  }, [
    trade,
    sendTransactionAsync,
    account,
    chainId,
    publicClient,
    swapCalls,
    t,
    addSwapTransaction,
    type,
    sendPaymasterTransaction,
    isPaymasterAvailable,
    isPaymasterTokenActive,
  ])
}

export const userRejectedError = (error: unknown): boolean => {
  return (
    error instanceof UserRejectedRequestError ||
    error instanceof TransactionRejectedError ||
    (typeof error !== 'string' && isUserRejected(error))
  )
}

export const eip5792UserRejectUpgradeError = (error: unknown) => {
  return error instanceof TransactionExecutionError && error.message.includes('user rejected the upgrade')
}
