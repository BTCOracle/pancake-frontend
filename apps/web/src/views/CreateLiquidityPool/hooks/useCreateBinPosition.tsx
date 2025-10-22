import { ChainId } from '@pancakeswap/chains'
import { useTranslation } from '@pancakeswap/localization'
import { useToast } from '@pancakeswap/uikit'
import { ToastDescriptionWithTx } from 'components/Toast'
import useCatchTxError from 'hooks/useCatchTxError'
import { useSwitchNetwork } from 'hooks/useSwitchNetwork'
import { useCallback } from 'react'
import { Address, Hex } from 'viem'

import { useAccount } from 'wagmi'

export const useCreateInfinityBinPosition = (targetChainId: ChainId, onDone?: () => void) => {
  const { t } = useTranslation()
  const { address: account, chainId } = useAccount()
  const { toastSuccess } = useToast()
  const { fetchWithCatchTxError, loading: pendingTx } = useCatchTxError()
  const { switchNetwork } = useSwitchNetwork()

  const createCLPosition = useCallback(
    async (param: {
      currency0Addr: Address
      currency1Addr: Address
      hookAddr?: Address
      fee: number
      parameters?: Hex
      liquidityConfigs: Hex[]
      salt?: Hex
      amountIn: Hex
      hookData?: Hex
    }) => {
      if (!account || targetChainId !== chainId) {
        if (targetChainId !== chainId) {
          switchNetwork(targetChainId)
        }
        return
      }
      const receipt = await fetchWithCatchTxError(async () => {
        // return infinityBinPositionManagerContract.write.mint(
        //   [
        //     {
        //       currency0: param.currency0Addr,
        //       currency1: param.currency1Addr,
        //       hooks: param?.hookAddr ?? '0x',
        //       poolManager: infinityBinPositionManagerContract.address,
        //       fee: param.fee,
        //       parameters: param?.parameters ?? '0x',
        //     },
        //     {
        //       liquidityConfigs: [],
        //       amountIn: param.amountIn,
        //       salt: param?.salt ?? '0x',
        //     },
        //     param.hookData ?? '0x',
        //   ],
        //   {
        //     account,
        //     chain,
        //   },
        // )
        return Promise.reject(new Error('not implement'))
      })
      if (receipt?.status) {
        onDone?.()
        toastSuccess(
          `${t('Position Created!')}`,
          <ToastDescriptionWithTx txHash={receipt.transactionHash}>
            {t('Infinity Bin Position Created')}
          </ToastDescriptionWithTx>,
        )
      }
    },
    [account, targetChainId, chainId, fetchWithCatchTxError, switchNetwork, onDone, toastSuccess, t],
  )

  // eslint-disable-next-line consistent-return
  return { createCLPosition, pendingTx }
}
