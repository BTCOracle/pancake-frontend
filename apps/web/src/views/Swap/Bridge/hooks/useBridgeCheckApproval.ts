import { CurrencyAmount } from '@pancakeswap/swap-sdk-core'
import { useQuery } from '@tanstack/react-query'
import useAccountActiveChain from 'hooks/useAccountActiveChain'
import { useMemo } from 'react'

import { useActiveChainId } from 'hooks/useActiveChainId'
import { useSubmitPermit2 } from 'hooks/usePermit2'
import { Address } from 'viem'
import { BridgeOrderWithCommands, InterfaceOrder, isBridgeOrder } from 'views/Swap/utils'
import { isSolana } from '@pancakeswap/chains'
import { postBridgeCheckApproval } from '../api'
import { useEVMToSolanaBridgeCalldata } from './useEVMToSolanaBridgeCalldata'
import { RELAY_STEP_ID } from '../types'

export const useBridgeCheckApproval = (order?: InterfaceOrder) => {
  const { account } = useAccountActiveChain()
  const { chainId: activeChainId } = useActiveChainId()

  const currencyAmountIn = useMemo(() => {
    // NOTE: this is only for Across bridge, not for Solana bridge
    return isBridgeOrder(order) && !isSolana(activeChainId)
      ? order?.trade?.routes?.find((r) => r.inputAmount.currency.chainId === activeChainId)?.inputAmount
      : undefined
  }, [order, activeChainId])

  const isNativeCurrency = currencyAmountIn?.currency?.isNative

  const isSolanaBridge = isBridgeOrder(order) && isSolana(order?.trade?.outputAmount?.currency?.chainId)

  const bridgeSolanaApproveCalldata = useEVMToSolanaBridgeCalldata({
    order: order as BridgeOrderWithCommands,
    stepType: RELAY_STEP_ID.APPROVE,
  })

  const {
    data: approvalData,
    error,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [
      'bridge-check-approval',
      account,
      isNativeCurrency ? 'native' : currencyAmountIn?.currency?.wrapped.address,
      currencyAmountIn?.currency?.chainId,
      currencyAmountIn?.quotient.toString(),
    ],
    queryFn: async () => {
      if (!currencyAmountIn || !account || !isBridgeOrder(order) || isNativeCurrency) return undefined

      try {
        const response = await postBridgeCheckApproval({
          currencyAmountIn,
          recipient: account as Address,
        })

        return response
      } catch (err) {
        console.error('Bridge approval check error:', err)
        throw err
      }
    },
    enabled: !!currencyAmountIn && !!account && !isSolanaBridge,
    retry: 3,
  })

  const isRequiredFromResponse = approvalData?.isApprovalRequired

  // NOTE: when approval response returns error, we should flag it as requiring approval to show the approval error
  // if native currency, no approval is needed
  const requiresApproval = isNativeCurrency
    ? false
    : typeof isRequiredFromResponse === 'boolean'
    ? isRequiredFromResponse
    : Boolean(approvalData?.error?.code || error)

  const permit2Details = useMemo(() => {
    if (!currencyAmountIn || !approvalData?.permit2Details) return undefined

    return {
      ...approvalData.permit2Details,
      amount: CurrencyAmount.fromRawAmount(
        currencyAmountIn?.currency.asToken,
        BigInt(approvalData.permit2Details?.amount ?? '0'),
      ),
    }
  }, [approvalData, currencyAmountIn])

  const { permit: signPermit2 } = useSubmitPermit2({
    currency: currencyAmountIn?.currency.asToken,
    spender: approvalData?.spender,
    permit2Details,
  })

  return useMemo(
    () =>
      isSolanaBridge
        ? {
            approvalData: {
              isApprovalRequired: Boolean(bridgeSolanaApproveCalldata),
              tokenAddress: bridgeSolanaApproveCalldata?.transactionData?.address,
              data: bridgeSolanaApproveCalldata?.transactionData?.calldata,
              spender: undefined,
              permit2Details: undefined,
              isPermit2Required: false,
              error: undefined,
            },
            requiresApproval: Boolean(bridgeSolanaApproveCalldata),
          }
        : {
            approvalData,
            requiresApproval,
            isLoading,
            refetch,
            signPermit2,
            error: error
              ? {
                  code: '500',
                  message: `Bridge approval check failed: ${error.message}`,
                }
              : undefined,
          },
    [
      requiresApproval,
      isLoading,
      signPermit2,
      refetch,
      approvalData,
      error,
      bridgeSolanaApproveCalldata,
      isSolanaBridge,
    ],
  )
}
