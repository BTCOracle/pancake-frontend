import { useTranslation } from '@pancakeswap/localization'
import { MaxUint256 } from '@pancakeswap/swap-sdk-core'
import { useToast } from '@pancakeswap/uikit'
import { ToastDescriptionWithTx } from 'components/Toast'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { useCallWithGasPrice } from 'hooks/useCallWithGasPrice'
import useCatchTxError from 'hooks/useCatchTxError'
import { useERC20, useSousChef } from 'hooks/useContract'
import { useCallback } from 'react'
import { useAppDispatch } from 'state'
import { updateUserAllowance } from 'state/actions'
import { useAccount } from 'wagmi'

export const useApprovePool = (lpContract: ReturnType<typeof useERC20>, sousId: any, earningTokenSymbol: any) => {
  const { toastSuccess } = useToast()
  const { chainId } = useActiveChainId()
  const { fetchWithCatchTxError, loading: pendingTx } = useCatchTxError()
  const { callWithGasPrice } = useCallWithGasPrice()
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const { address: account } = useAccount()
  const sousChefContract = useSousChef(sousId)

  const handleApprove = useCallback(async () => {
    if (sousChefContract) {
      const receipt = await fetchWithCatchTxError(() => {
        return callWithGasPrice(lpContract, 'approve', [(sousChefContract as any)?.address, MaxUint256])
      })
      if (receipt?.status) {
        toastSuccess(
          t('Contract Enabled'),
          <ToastDescriptionWithTx txHash={receipt.transactionHash}>
            {t('You can now stake in the %symbol% pool!', { symbol: earningTokenSymbol })}
          </ToastDescriptionWithTx>,
        )
        if (account && chainId) {
          dispatch(updateUserAllowance({ sousId, account, chainId }))
        }
      }
    }
  }, [
    chainId,
    account,
    dispatch,
    lpContract,
    sousChefContract,
    sousId,
    earningTokenSymbol,
    t,
    toastSuccess,
    callWithGasPrice,
    fetchWithCatchTxError,
  ])

  return { handleApprove, pendingTx }
}
