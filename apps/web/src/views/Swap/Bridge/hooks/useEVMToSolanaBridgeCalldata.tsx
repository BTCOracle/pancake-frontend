import { useQuery } from '@tanstack/react-query'
import { useUserSlippage } from '@pancakeswap/utils/user'
import useAccountActiveChain from 'hooks/useAccountActiveChain'
import { BridgeOrderWithCommands, isBridgeOrder } from 'views/Swap/utils'
import { Calldata } from 'hooks/usePermit2'
import { isEvm, isSolana } from '@pancakeswap/chains'
import { useSwapState } from 'state/swap/hooks'
import { isValidSolanaAddress } from 'utils/isValidSolanaAddress'
import { getSolanaBridgeCalldata } from '../api'
import { RELAY_STEP_ID } from '../types'

interface UseEVMToSolanaBridgeCalldataParams {
  order?: BridgeOrderWithCommands
  stepType?: RELAY_STEP_ID
}

export const useEVMToSolanaBridgeCalldata = ({
  order,
  stepType = RELAY_STEP_ID.DEPOSIT,
}: UseEVMToSolanaBridgeCalldataParams):
  | {
      transactionData: Calldata
      gasFee: string
    }
  | undefined => {
  const { account, solanaAccount } = useAccountActiveChain()
  const [allowedSlippage] = useUserSlippage()
  const { recipient: recipientAddress } = useSwapState()

  const isEvmToSolanaBridge =
    isBridgeOrder(order) &&
    isEvm(order?.trade?.inputAmount?.currency?.chainId) &&
    isSolana(order?.trade?.outputAmount?.currency?.chainId)

  const { data } = useQuery<
    {
      id: RELAY_STEP_ID
      txnCalldata: {
        transactionData: Calldata
        gasFee: string
      }
    }[]
  >({
    queryKey: [
      'evm-to-solana-bridge-calldata',
      order?.bridgeTransactionData?.requestId,
      order?.trade?.inputAmount?.currency?.symbol,
      order?.trade?.inputAmount?.currency?.chainId,
      order?.trade?.outputAmount?.currency?.symbol,
      order?.trade?.outputAmount?.currency?.chainId,
      order?.trade?.inputAmount?.quotient?.toString(),
      order?.trade?.outputAmount?.quotient?.toString(),
      solanaAccount,
      account,
      allowedSlippage,
      recipientAddress,
    ],
    queryFn: async () => {
      if (!order || !solanaAccount || !account) {
        return undefined
      }

      if (recipientAddress && !isValidSolanaAddress(recipientAddress)) {
        return undefined
      }

      const recipient = recipientAddress || solanaAccount

      const calldataResponse = await getSolanaBridgeCalldata({
        order,
        recipient,
        user: account,
        allowedSlippage,
      })

      return calldataResponse?.steps?.map((step) => {
        const sD = step.items[0].data
        return {
          id: step.id,
          txnCalldata: {
            transactionData: {
              address: sD.to,
              calldata: sD.data,
              value: sD.value,
            } as Calldata,
            gasFee: sD.gas,
          },
        }
      })
    },
    enabled: isEvmToSolanaBridge && !!order && !!account && !!solanaAccount,
    retry: 3,
    refetchOnWindowFocus: false,
  })

  return data?.find((step) => step.id === stepType)?.txnCalldata
}
