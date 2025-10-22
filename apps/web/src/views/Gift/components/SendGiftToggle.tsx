import { useTranslation } from '@pancakeswap/localization'
import { FlexGap, Text, Toggle } from '@pancakeswap/uikit'
import { SecondaryCard } from 'components/SecondaryCard'
import { useEffect } from 'react'
import { logGTMToggleSendGiftEvent } from 'utils/customGTMEventTracking'
import { CHAINS_WITH_GIFT_CLAIM } from '../constants'
import { useSendGiftContext } from '../providers/SendGiftProvider'
import { GasSponsor } from './GasSponsor'

export const SendGiftToggle = ({
  children,
  tokenChainId,
  isNativeToken,
}: {
  tokenChainId?: number
  isNativeToken: boolean
  children: (isSendGiftOn: boolean) => React.ReactNode
}) => {
  const { t } = useTranslation()
  const { includeStarterGas, setIncludeStarterGas, setIsSendGift, isSendGift } = useSendGiftContext()

  const isSupportedChain = tokenChainId && CHAINS_WITH_GIFT_CLAIM.includes(tokenChainId)

  // if the token is native token, disable the include starter gas
  useEffect(() => {
    if (isNativeToken && includeStarterGas) {
      setIncludeStarterGas(false)
    }
  }, [isNativeToken, setIncludeStarterGas, includeStarterGas])

  if (!isSupportedChain) {
    return children(false)
  }

  return (
    <>
      <SecondaryCard>
        <FlexGap alignItems="center" justifyContent="space-between">
          <FlexGap alignItems="center" gap="8px" flexDirection="column">
            <Text fontSize="20px" fontWeight="bold">
              {t('Send as a gift')}
            </Text>
          </FlexGap>
          <Toggle
            id="toggle-send-gift"
            checked={isSendGift}
            scale="md"
            onChange={() => {
              const newSendGiftState = !isSendGift
              setIsSendGift(newSendGiftState)
              logGTMToggleSendGiftEvent(newSendGiftState, tokenChainId)
            }}
          />
        </FlexGap>
      </SecondaryCard>
      {children(isSendGift)}
      {isSendGift && !isNativeToken && <GasSponsor tokenChainId={tokenChainId} />}
    </>
  )
}
