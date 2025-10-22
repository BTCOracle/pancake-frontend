import { useTranslation } from '@pancakeswap/localization'
import { useToast } from '@pancakeswap/uikit'
import { ToastDescriptionWithTx } from 'components/Toast'
import useCatchTxError from 'hooks/useCatchTxError'
import { atom, useAtom } from 'jotai'
import { useCallback, useMemo } from 'react'
import { GetContractFn } from 'utils/contractHelpers'
import { Abi, ContractFunctionArgs, ContractFunctionName } from 'viem'
import { WalletClient } from 'viem/_types/clients/createWalletClient'
import { useCallWithGasPrice } from './useCallWithGasPrice'

interface UXOptions {
  successToast: {
    title: string
    description: string
  }
  value?: bigint
}

export const createWriteContractCallback = <
  TAbi extends Abi | readonly unknown[],
  TWalletClient extends WalletClient,
  TMethod extends ContractFunctionName<TAbi, 'nonpayable' | 'payable'>,
>(
  getContract: GetContractFn<TAbi, TWalletClient>,
  method: TMethod,
) => {
  const statusAtom = atom<string>('IDLE')
  const txHashAtom = atom<string>('')

  return () => {
    const { callWithGasPrice } = useCallWithGasPrice()
    const { fetchWithCatchTxError, loading } = useCatchTxError()
    const { t } = useTranslation()
    const contract = useMemo(() => {
      return getContract()
    }, [])
    const [status, setStatus] = useAtom(statusAtom)
    const [txHash, setTxHash] = useAtom(txHashAtom)
    const { toastSuccess } = useToast()

    const callMethod = useCallback(
      async (
        args: ContractFunctionArgs<TAbi, 'nonpayable' | 'payable', TMethod>,
        options?: UXOptions,
      ): Promise<
        | {
            hash: `0x${string}`
          }
        | undefined
      > => {
        setStatus('PENDING')
        const receipt = await fetchWithCatchTxError(async () => {
          const result = await callWithGasPrice(
            {
              abi: contract.abi as Abi,
              account: contract.account,
              chain: contract.chain,
              address: contract.address,
            },
            method,
            // @ts-ignore
            args,
            {
              value: options?.value,
            },
          )
          setTxHash(result.hash)
          setStatus('CONFIRMING')
          return result
        })

        if (receipt?.status === 'success') {
          // const transactionReceipt = await waitForTransaction({ hash })
          setStatus('CONFIRMED')
          toastSuccess(
            options?.successToast.title || t('Success'),
            options?.successToast.description && (
              <ToastDescriptionWithTx txHash={receipt.transactionHash}>
                {options.successToast.description}
              </ToastDescriptionWithTx>
            ),
          )
          return
        }
        setStatus('FAILED')
      },
      [contract, setStatus, setTxHash, callWithGasPrice, fetchWithCatchTxError, toastSuccess, t],
    )

    return { callMethod, status, txHash, loading }
  }
}
