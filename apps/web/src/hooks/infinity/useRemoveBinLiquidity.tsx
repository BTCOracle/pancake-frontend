import { ChainId } from '@pancakeswap/chains'
import { PoolKey, encodeBinPositionManagerRemoveLiquidityCalldata, getPoolId } from '@pancakeswap/infinity-sdk'
import { useTranslation } from '@pancakeswap/localization'
import { usePublicNodeWaitForTransaction } from 'hooks/usePublicNodeWaitForTransaction'
import { useCallback, useState } from 'react'
import { useLatestTxReceipt } from 'state/farmsV4/state/accountPositions/hooks/useLatestTxReceipt'
import { useTransactionAdder } from 'state/transactions/hooks'
import { calculateGasMargin } from 'utils'
import { getInfinityPositionManagerAddress } from 'utils/addressHelpers'
import { isUserRejected } from 'utils/sentry'
import { transactionErrorToUserReadableMessage } from 'utils/transactionErrorToUserReadableMessage'
import { getViemClients } from 'utils/viem'
import type { Address, Hex } from 'viem'
import { type UseSendTransactionReturnType, useSendTransaction } from 'wagmi'

export type RemoveBinLiquidityParam = {
  poolKey: PoolKey<'Bin'>
  amount0Min: bigint
  amount1Min: bigint
  ids: number[]
  amounts: bigint[]
  hookData?: Hex
  deadline: bigint
  wrapAddress?: Address
}

export const removeBinLiquidity = async (
  sendTransactionAsync: UseSendTransactionReturnType['sendTransactionAsync'],
  params: RemoveBinLiquidityParam,
  to: Address,
  chainId: ChainId,
  account: Address,
  onDone?: (response: Hex) => void,
  onError?: (error: any) => void,
  setAttemptingTx?: (attemptingTx: boolean) => void,
) => {
  console.debug('debug removeLiquidity', params)
  const data = encodeBinPositionManagerRemoveLiquidityCalldata(
    {
      poolKey: params.poolKey,
      amount0Min: params.amount0Min,
      amount1Min: params.amount1Min,
      ids: params.ids,
      amounts: params.amounts,
      from: account,
      hookData: params.hookData,
      recipient: account,
      wrapAddress: params.wrapAddress,
    },
    params.deadline,
  )

  getViemClients({ chainId })
    ?.estimateGas({
      account,
      to,
      data,
    })
    .then((gasLimit) => {
      setAttemptingTx?.(true)
      return sendTransactionAsync({
        account,
        to,
        data,
        gas: calculateGasMargin(gasLimit),
        chainId,
      })
    })
    .then((response) => {
      onDone?.(response)
    })
    .catch((err) => {
      onError?.(err)
      // we only care if the error is something _other_ than the user rejected the tx
      // if (!isUserRejected(err)) {
      //   setTxnErrorMessage(transactionErrorToUserReadableMessage(err, t))
      // }
    })
}

export const useBinRemoveLiquidity = (
  chainId: ChainId | undefined,
  account: Address | undefined,
  onDone?: (response: Hex) => void,
  onError?: (error: any) => void,
) => {
  const addTransaction = useTransactionAdder()
  const [txHash, setTxHash] = useState<Address | null>(null)
  const [attemptingTx, setAttemptingTx] = useState<boolean>(false)
  const [txnErrorMessage, setTxnErrorMessage] = useState<string | undefined>()
  const { t } = useTranslation()
  const positionManagerAddress = getInfinityPositionManagerAddress('Bin', chainId)
  const { sendTransactionAsync } = useSendTransaction()
  const [, setLatestTxReceipt] = useLatestTxReceipt()
  const { waitForTransaction } = usePublicNodeWaitForTransaction(chainId)

  const removeLiquidity = useCallback(
    async (params: RemoveBinLiquidityParam) => {
      if (!chainId || !account) return
      const onTxDone = async (response: Hex) => {
        setTxHash(response)
        addTransaction(
          { hash: response },
          {
            type: 'remove-liquidity-infinity-bin',
            summary: `Remove liquidity from ${getPoolId(params.poolKey)}`,
          },
        )
        const receipt = await waitForTransaction({
          hash: response,
        })
        // waiting for transaction receipt
        setLatestTxReceipt({ blockHash: receipt.blockHash, status: receipt.status })
        setAttemptingTx?.(false)
        onDone?.(response)
      }

      const onTxError = (error: any) => {
        setAttemptingTx?.(false)
        console.error(error)

        if (!isUserRejected(error)) {
          setTxnErrorMessage(transactionErrorToUserReadableMessage(error, t))
        }
        onError?.(error)
      }

      await removeBinLiquidity(
        sendTransactionAsync,
        params,
        positionManagerAddress,
        chainId,
        account,
        onTxDone,
        onTxError,
        setAttemptingTx,
      )
    },
    [
      setLatestTxReceipt,
      positionManagerAddress,
      sendTransactionAsync,
      chainId,
      account,
      waitForTransaction,
      onDone,
      addTransaction,
      onError,
      t,
    ],
  )
  return { removeLiquidity, txHash, attemptingTx, txnErrorMessage }
}
