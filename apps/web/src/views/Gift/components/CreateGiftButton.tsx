import { useTranslation } from '@pancakeswap/localization'
import { CurrencyAmount, NativeCurrency, Token } from '@pancakeswap/sdk'
import { Button } from '@pancakeswap/uikit'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { ApprovalState, useApproveCallback } from 'hooks/useApproveCallback'
import { useSwitchNetwork } from 'hooks/useSwitchNetwork'
import { useCallback, useMemo, useState } from 'react'
import { logGTMGiftCreateEvent } from 'utils/customGTMEventTracking'
import { GIFT_PANCAKE_V1_ADDRESS } from '../constants'

export const CreateGiftButton = ({
  isLoading,
  handleCreateGift,
  tokenAmount,
}: {
  isLoading: boolean
  handleCreateGift: () => void
  tokenAmount: CurrencyAmount<Token | NativeCurrency>
}) => {
  const { switchNetwork } = useSwitchNetwork()
  const { chainId } = useActiveChainId()

  const isChainMatched = chainId === tokenAmount?.currency.chainId

  const [isApproving, setIsApproving] = useState(false)
  const { t } = useTranslation()
  // check whether the user has approved the router on the tokens
  const {
    approvalState,
    approveCallback: approveGiftCallback,
    currentAllowance: currentAllowanceGift,
  } = useApproveCallback(tokenAmount, GIFT_PANCAKE_V1_ADDRESS)

  const needApprove =
    tokenAmount.currency.isToken &&
    approvalState !== ApprovalState.APPROVED &&
    currentAllowanceGift?.lessThan(tokenAmount)

  const onCreateGiftClick = useCallback(async () => {
    logGTMGiftCreateEvent(tokenAmount.currency.chainId)

    if (needApprove) {
      setIsApproving(true)
      approveGiftCallback()
        .then(() => {
          handleCreateGift()
        })
        .finally(() => {
          setIsApproving(false)
        })
    } else {
      handleCreateGift()
    }
  }, [tokenAmount, approveGiftCallback, handleCreateGift])

  const text = useMemo(() => {
    if (!isChainMatched) {
      return t('Switch network')
    }

    if (isLoading) {
      return t('Creating...')
    }

    if (isApproving) {
      return t('Approving...')
    }

    if (needApprove) {
      return t('Approve & Create Gift')
    }

    return t('Create Gift')
  }, [isChainMatched, t, isLoading, isApproving, needApprove])

  return (
    <Button
      id="create-gift-button"
      disabled={isLoading || isApproving}
      onClick={() => {
        if (!isChainMatched) {
          switchNetwork(tokenAmount.currency.chainId)
        } else {
          onCreateGiftClick()
        }
      }}
      width="100%"
    >
      {text}
    </Button>
  )
}
