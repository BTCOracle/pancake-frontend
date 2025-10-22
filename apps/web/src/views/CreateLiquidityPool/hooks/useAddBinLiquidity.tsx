import type { ChainId } from '@pancakeswap/chains'
import {
  AddBinLiquidityMulticallParams,
  BinLiquidityShape,
  type PoolKey,
  addBinLiquidityMulticall,
  getIsInitializedByPoolKey,
} from '@pancakeswap/infinity-sdk'
import { useTranslation } from '@pancakeswap/localization'
import type { Currency } from '@pancakeswap/swap-sdk-core'
import { Modal, useModal } from '@pancakeswap/uikit'
import type { Permit2Signature } from '@pancakeswap/universal-router-sdk'
import { ConfirmationPendingContent } from '@pancakeswap/widgets-internal'
import { useCurrencyByChainId } from 'hooks/Tokens'
import { useInfinityBinPositionManagerContract } from 'hooks/useContract'
import { usePublicNodeWaitForTransaction } from 'hooks/usePublicNodeWaitForTransaction'
import { useCallback, useState } from 'react'
import { useLatestTxReceipt } from 'state/farmsV4/state/accountPositions/hooks/useLatestTxReceipt'
import { useTransactionAdder } from 'state/transactions/hooks'
import { calculateGasMargin } from 'utils'
import { formatRawAmount } from 'utils/formatCurrencyAmount'
import { isUserRejected } from 'utils/sentry'
import { transactionErrorToUserReadableMessage } from 'utils/transactionErrorToUserReadableMessage'
import { getViemClients } from 'utils/viem'
import { type Address, Hash, type Hex, PublicClient, stringify } from 'viem'
import { ErrorModal } from 'views/AddLiquidityInfinity/components/ErrorModal'
import { type UseSendTransactionReturnType, usePublicClient, useSendTransaction } from 'wagmi'

export type AddBinLiquidityParams = {
  poolKey: PoolKey<'Bin'>
  liquidityShape: BinLiquidityShape
  binNums: number
  lowerBinId: number
  upperBinId: number
  activeIdDesired: number
  idSlippage: bigint
  amount0Desired: bigint
  amount1Desired: bigint
  amount0Max: bigint
  amount1Max: bigint
  recipient: Hex
  deadline: bigint
  modifyPositionHookData?: Hex
  currency0: Currency
  currency1: Currency
  token0Permit2Signature?: Permit2Signature | undefined
  token1Permit2Signature?: Permit2Signature | undefined
}

export const addBinLiquidity = async (
  sendTransactionAsync: UseSendTransactionReturnType['sendTransactionAsync'],
  params: AddBinLiquidityParams,
  to: Address,
  chainId: ChainId,
  account: Address,
  onDone?: (response: Hash) => void,
  onError?: (error: any) => void,
  setAttemptingTx?: (attemptingTx: boolean) => void,
  publicClient?: PublicClient,
) => {
  let isInitialized = true
  const viemPublicClient = getViemClients({ chainId })
  try {
    isInitialized = await getIsInitializedByPoolKey(viemPublicClient, params.poolKey)
  } catch (error) {
    console.error(error)
  }

  const addBinLiquidityParams: AddBinLiquidityMulticallParams = {
    isInitialized,
    activeIdDesired: params.activeIdDesired,
    idSlippage: params.idSlippage,
    liquidityShape: params.liquidityShape,
    // binNums: params.binNums,
    lowerBinId: params.lowerBinId,
    upperBinId: params.upperBinId,
    poolKey: params.poolKey,
    amount0: params.amount0Desired,
    amount1: params.amount1Desired,
    amount0Max: params.amount0Max,
    amount1Max: params.amount1Max,
    owner: account,
    deadline: params.deadline,
    token0Permit2Signature: params.token0Permit2Signature,
    token1Permit2Signature: params.token1Permit2Signature,
    modifyPositionHookData: params.modifyPositionHookData,
  }
  console.debug('debug addBinLiquidityParams', stringify(addBinLiquidityParams, null, 2))
  const data = addBinLiquidityMulticall(addBinLiquidityParams)
  const value = params.currency0.isNative ? params.amount0Desired : 0n

  return viemPublicClient
    ?.estimateGas({
      account,
      to,
      data,
      value,
    })
    .then((gasLimit) => {
      setAttemptingTx?.(true)
      try {
        const tx = sendTransactionAsync({
          account,
          to,
          data,
          value,
          gas: calculateGasMargin(gasLimit),
          chainId,
        })
        return tx
      } catch (error) {
        console.error('send tx error')
        console.trace(error)
        throw error
      }
    })
    .then(async (response) => {
      return onDone?.(response)
    })
    .catch((err) => {
      console.error('add liq error')
      console.trace(err)
      onError?.(err)
      // we only care if the error is something _other_ than the user rejected the tx
      // if (!isUserRejected(err)) {
      //   setTxnErrorMessage(transactionErrorToUserReadableMessage(err, t))
      // }
    })
    .finally(() => {
      setAttemptingTx?.(false)
    })
}

const ConfirmModal: React.FC<React.PropsWithChildren> = (props) => {
  return (
    <Modal title="" headerBackground="transparent" headerBorderColor="transparent" hideCloseButton {...props}>
      <ConfirmationPendingContent />
    </Modal>
  )
}

export const useAddBinLiquidity = (
  chainId: ChainId,
  account: Address,
  baseCurrencyAddress: Address,
  quoteCurrencyAddress: Address,
  onDone?: () => void,
  onError?: (error: any) => void,
) => {
  const addTransaction = useTransactionAdder()
  const publicClient = usePublicClient({ chainId })
  const [txHash, setTxHash] = useState<Address | null>(null)
  const [attemptingTx, setAttemptingTx] = useState<boolean>(false)
  const [txnErrorMessage, setTxnErrorMessage] = useState<string | undefined>()
  const { t } = useTranslation()
  const baseCurrency = useCurrencyByChainId(baseCurrencyAddress, chainId)
  const positionManagerContract = useInfinityBinPositionManagerContract(chainId)
  const quoteCurrency = useCurrencyByChainId(quoteCurrencyAddress, chainId)
  const { sendTransactionAsync } = useSendTransaction()
  const [, setLatestTxReceipt] = useLatestTxReceipt()
  const { waitForTransaction } = usePublicNodeWaitForTransaction(chainId)
  const [onPresentConfirmationModal, onDismissConfirmationModal] = useModal(
    <ConfirmModal />,
    true,
    true,
    'infinity-bin-add-liquidity-modal',
  )
  const [onPresentErrorModal] = useModal(
    <ErrorModal title={t('Add Liquidity')} subTitle={txnErrorMessage} />,
    true,
    true,
    'infinity-bin-add-liquidity-error-modal',
  )

  const addLiquidity = useCallback(
    (params: AddBinLiquidityParams) => {
      onPresentConfirmationModal()
      const onTxDone = async (response: Hash) => {
        try {
          onDismissConfirmationModal()
          setTxHash(response)
          if (baseCurrency && quoteCurrency) {
            const baseAmount = formatRawAmount(params.amount0Desired?.toString() ?? '0', baseCurrency?.decimals, 4)
            const quoteAmount = formatRawAmount(params.amount1Desired?.toString() ?? '0', quoteCurrency.decimals, 4)
            addTransaction(
              { hash: response },
              {
                type: 'add-liquidity-infinity-bin',
                summary: `Increase ${baseAmount} ${baseCurrency?.symbol} and ${quoteAmount} ${quoteCurrency?.symbol}`,
              },
            )
          }
          const receipt = await waitForTransaction({
            hash: response,
          })
          setLatestTxReceipt({ blockHash: receipt.blockHash, status: receipt.status })
          onDone?.()
        } catch (error) {
          console.error('Error in onTxDone', error)
        }
      }

      const onTxError = (error: any) => {
        console.error(error)
        onDismissConfirmationModal()
        if (!isUserRejected(error)) {
          setTxnErrorMessage(transactionErrorToUserReadableMessage(error, t))
          onPresentErrorModal()
        }
        onError?.(error)
      }

      return addBinLiquidity(
        sendTransactionAsync,
        params,
        positionManagerContract.address,
        chainId,
        account,
        onTxDone,
        onTxError,
        setAttemptingTx,
        publicClient,
      )
    },
    [
      onPresentConfirmationModal,
      onPresentErrorModal,
      sendTransactionAsync,
      positionManagerContract.address,
      chainId,
      account,
      baseCurrency,
      quoteCurrency,
      setLatestTxReceipt,
      onDismissConfirmationModal,
      t,
      onDone,
      waitForTransaction,
      addTransaction,
      onError,
      publicClient,
    ],
  )
  return { addBinLiquidity: addLiquidity, txHash, attemptingTx, txnErrorMessage }
}
