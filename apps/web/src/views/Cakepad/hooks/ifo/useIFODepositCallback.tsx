import { useTranslation } from '@pancakeswap/localization'
import type { Currency, CurrencyAmount } from '@pancakeswap/swap-sdk-core'
import { useToast } from '@pancakeswap/uikit'
import { ToastDescriptionWithTx } from 'components/Toast'
import useCatchTxError from 'hooks/useCatchTxError'
import { useCallback, useState } from 'react'
import { useLatestTxReceipt } from 'state/farmsV4/state/accountPositions/hooks/useLatestTxReceipt'
import { isAddressEqual } from 'utils'
import { logger } from 'utils/datadog'
import { erc20Abi, WriteContractReturnType, zeroAddress } from 'viem'
import { userRejectedError } from 'views/Swap/V3Swap/hooks/useSendSwapTransaction'
import { useAccount, useWriteContract } from 'wagmi'
import { useSetAtom } from 'jotai'
import { useApproveCallback } from 'hooks/useApproveCallback'
import { publicClient } from 'utils/viem'
import useIfo from '../useIfo'
import { useIFOPoolInfo } from './useIFOPoolInfo'
import { useIFOUserInfo } from './useIFOUserInfo'
import { updateIfoVer } from '../../atom/ifoVersionAtom'

export const useIFODepositCallback = () => {
  const { t } = useTranslation()
  const { address: account } = useAccount()
  const { toastSuccess, toastWarning } = useToast()

  // IFO Contract
  const { ifoContract } = useIfo()
  const pools = useIFOPoolInfo()

  // Txn states
  const updateVersion = useSetAtom(updateIfoVer)
  const [, setLatestTxReceipt] = useLatestTxReceipt()
  const { fetchWithCatchTxError, loading: isPending } = useCatchTxError({ throwUserRejectError: true })
  const [status, setStatus] = useState<'IDLE' | 'PENDING' | 'CONFIRMING' | 'CONFIRMED'>('IDLE')
  const [txHash, setTxHash] = useState<string>('')

  // Approval State
  const { writeContractAsync } = useWriteContract()

  const deposit = useCallback(
    async (
      pid: number,
      amount: CurrencyAmount<Currency>,
      onSucc?: () => void,
      onFinish?: () => void,
    ): Promise<WriteContractReturnType | undefined> => {
      if (!account || !ifoContract?.write || (!pid && pid !== 0)) return

      const depositAddress = amount.currency.isNative ? zeroAddress : amount.currency.address
      const poolToken = pools[pid]?.poolToken

      if (!poolToken || !isAddressEqual(poolToken, depositAddress)) {
        console.error('Invalid pool token')
        return
      }
      const value = amount.currency.isNative ? amount.quotient : 0n
      const amountPool = amount.quotient
      setStatus('PENDING')
      try {
        const receipt = await fetchWithCatchTxError(async () => {
          if (amount.currency.isToken) {
            const allowance = await publicClient({ chainId: amount.currency.chainId }).readContract({
              address: amount.currency.address,
              abi: erc20Abi,
              functionName: 'allowance',
              args: [account, ifoContract.address],
            })

            if (allowance < amountPool) {
              await writeContractAsync({
                address: amount.currency.address,
                abi: erc20Abi,
                functionName: 'approve',
                args: [ifoContract.address, amountPool],
              })
            }
          }
          const tx = await writeContractAsync({
            address: ifoContract.address,
            abi: ifoContract.abi as any,
            functionName: 'depositPool',
            args: [amountPool, pid],
            value,
          })
          setTxHash(tx as string)
          setStatus('CONFIRMING')
          return tx
        })
        if (receipt?.status) {
          setLatestTxReceipt(receipt)
          toastSuccess(t('Deposit successful'), <ToastDescriptionWithTx bscTrace txHash={receipt.transactionHash} />)
          setStatus('CONFIRMED')
          onSucc?.()
        } else {
          setStatus('IDLE')
        }
      } catch (error) {
        if (userRejectedError(error)) {
          toastWarning(
            t('You canceled deposit'),
            t(`You didn't confirm %symbol% deposit in your wallet`, {
              symbol: amount.currency.symbol,
            }),
          )
        }

        setStatus('IDLE')
      } finally {
        onFinish?.()
      }
    },
    [
      account,
      ifoContract,
      pools,
      fetchWithCatchTxError,
      writeContractAsync,
      setLatestTxReceipt,
      toastSuccess,
      t,
      toastWarning,
      updateVersion,
    ],
  )

  return {
    deposit,
    isPending,
    status,
    txHash,
  }
}
