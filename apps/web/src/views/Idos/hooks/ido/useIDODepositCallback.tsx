import { useTranslation } from '@pancakeswap/localization'
import type { Currency, CurrencyAmount } from '@pancakeswap/swap-sdk-core'
import { useToast } from '@pancakeswap/uikit'
import { ToastDescriptionWithTx } from 'components/Toast'
import useCatchTxError from 'hooks/useCatchTxError'
import { useCallback } from 'react'
import { useLatestTxReceipt } from 'state/farmsV4/state/accountPositions/hooks/useLatestTxReceipt'
import { isAddressEqual } from 'utils'
import { logger } from 'utils/datadog'
import { erc20Abi, WriteContractReturnType, zeroAddress } from 'viem'
import { userRejectedError } from 'views/Swap/V3Swap/hooks/useSendSwapTransaction'
import { useAccount, useWriteContract } from 'wagmi'
import {
  useW3WAccountSign,
  W3WSignAlreadyParticipatedError,
  W3WSignNotSupportedError,
  W3WSignRestrictedError,
} from '../w3w/useW3WAccountSign'
import { useIDOContract } from './useIDOContract'
import { useIDOPoolInfo } from './useIDOPoolInfo'
import { useIDOUserInfo } from './useIDOUserInfo'

class W3WSignError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'W3WSignError'
  }
}

export const useIDODepositCallback = () => {
  const idoContract = useIDOContract()
  const { t } = useTranslation()
  const { address: account } = useAccount()
  const { toastSuccess, toastWarning } = useToast()
  const [, setLatestTxReceipt] = useLatestTxReceipt()
  const { data: poolInfo } = useIDOPoolInfo()
  const { fetchWithCatchTxError, loading: isPending } = useCatchTxError({ throwUserRejectError: true })
  const { refetch } = useIDOUserInfo()
  const sign = useW3WAccountSign()
  const { writeContractAsync } = useWriteContract()

  const deposit = useCallback(
    async (
      pid: number,
      amount: CurrencyAmount<Currency>,
      onFinish?: () => void,
    ): Promise<WriteContractReturnType | undefined> => {
      if (!account || !idoContract?.write || (!pid && pid !== 0)) return

      const depositAddress = amount.currency.isNative ? zeroAddress : amount.currency.address
      const poolToken = pid === 0 ? poolInfo?.pool0Info?.poolToken : poolInfo?.pool1Info?.poolToken

      if (!poolToken || !isAddressEqual(poolToken, depositAddress)) {
        console.error('Invalid pool token')
        return
      }
      const value = amount.currency.isNative ? amount.quotient : 0n
      const amountPool = amount.currency.isNative ? 0n : amount.quotient
      try {
        const receipt = await fetchWithCatchTxError(async () => {
          const { signature, expireAt } = await sign()

          if (amount.currency.isToken) {
            await writeContractAsync({
              address: amount.currency.address,
              abi: erc20Abi,
              functionName: 'approve',
              args: [idoContract.address, amount.quotient],
            })
          }

          if (!signature || !expireAt) {
            throw new W3WSignError('Invalid signature or expiredAt')
          }

          return idoContract.write.depositPool([amountPool, pid, BigInt(expireAt), `0x${signature}`], {
            account,
            chain: idoContract.chain,
            value,
          })
        })
        if (receipt?.status) {
          setLatestTxReceipt(receipt)
          toastSuccess(t('Deposit successful'), <ToastDescriptionWithTx bscTrace txHash={receipt.transactionHash} />)
        }
      } catch (error) {
        if (error instanceof W3WSignRestrictedError) {
          toastWarning(t('Restricted address detected'), t('You cannot participate in this TGE'))
        } else if (error instanceof W3WSignNotSupportedError) {
          toastWarning(t('Method not support '), t('Please upgrade your wallet app'))
        } else if (error instanceof W3WSignAlreadyParticipatedError) {
          toastWarning(t('Account Already Participated'), t('You have already participated in this TGE'))
        } else if (userRejectedError(error)) {
          toastWarning(
            t('You canceled deposit'),
            t(`You didn't confirm %symbol% deposit in your wallet`, {
              symbol: amount.currency.symbol,
            }),
          )
        }
        console.error(error)
        logger.error(
          '[ido]: Error deposit ',
          {
            error,
            account,
            chainId: idoContract?.chain?.id,
            amount: amount?.quotient,
            address: idoContract?.address,
          },
          error instanceof Error ? error : new Error('unknown error'),
        )
      } finally {
        onFinish?.()
        refetch()
      }
    },
    [
      account,
      idoContract,
      poolInfo?.pool0Info?.poolToken,
      poolInfo?.pool1Info?.poolToken,
      fetchWithCatchTxError,
      sign,
      writeContractAsync,
      setLatestTxReceipt,
      toastSuccess,
      t,
      toastWarning,
      refetch,
    ],
  )

  return {
    deposit,
    isPending,
  }
}
