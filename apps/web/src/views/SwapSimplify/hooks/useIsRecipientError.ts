import { useDebounce } from '@pancakeswap/hooks'
import { useGetENSAddressByName } from 'hooks/useGetENSAddressByName'
import { useMemo } from 'react'
import { useSwapState } from 'state/swap/hooks'
import { safeGetAddress } from 'utils'
import { Field } from 'state/swap/actions'
import { isSolana } from '@pancakeswap/chains'
import { isValidSolanaAddress } from 'utils/isValidSolanaAddress'
import { useAllowRecipient } from '../../Swap/V3Swap/hooks'

export const useIsRecipientError = () => {
  const {
    recipient,
    [Field.OUTPUT]: { chainId: outputChainId },
  } = useSwapState()
  const allowRecipient = useAllowRecipient()
  const debounceEnsName = useDebounce(recipient, 500)
  const recipientENSAddress = useGetENSAddressByName(debounceEnsName ?? undefined)

  const resolvedAddress = useMemo(() => {
    if (!allowRecipient || recipient === null) return undefined

    if (outputChainId && isSolana(outputChainId)) {
      return isValidSolanaAddress(recipient) ? recipient : undefined
    }

    const address = safeGetAddress(recipient) ? recipient : safeGetAddress(recipientENSAddress)

    return address
  }, [recipient, allowRecipient, recipientENSAddress, outputChainId])

  const isRecipientEmpty = useMemo(() => {
    if (!allowRecipient || recipient === null) return false
    return recipient.length === 0
  }, [allowRecipient, recipient])

  return {
    isRecipientError: Boolean(recipient?.length && recipient.length > 0 && !resolvedAddress),
    isRecipientEmpty,
    resolvedAddress,
  }
}
