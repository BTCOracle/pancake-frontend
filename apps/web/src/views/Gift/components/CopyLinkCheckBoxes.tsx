import { useTranslation } from '@pancakeswap/localization'
import { Button, Checkbox, Flex, Text } from '@pancakeswap/uikit'
import { useMenuTab, WalletView } from 'components/Menu/UserMenu/providers/MenuTabProvider'
import { ViewState } from 'components/WalletModalV2/type'
import { useWalletModalV2ViewState } from 'components/WalletModalV2/WalletModalV2ViewStateProvider'
import { useState } from 'react'

export const CopyLinkCheckBoxes = () => {
  const { t } = useTranslation()
  const [isCodeCopied, setIsCodeCopied] = useState(false)
  const [understandsRecovery, setUnderstandsRecovery] = useState(false)

  const { setView } = useMenuTab()
  const allChecked = isCodeCopied && understandsRecovery
  const { setViewState } = useWalletModalV2ViewState()

  return (
    <>
      <Flex alignItems="center" width="100%">
        <Checkbox scale="xs" checked={isCodeCopied} onChange={(e) => setIsCodeCopied(e.target.checked)} />
        <Text ml="8px" fontSize="12px">
          {t(`I've copied the claim code and saved it securely.`)}
        </Text>
      </Flex>
      <Flex alignItems="center" width="100%" mb="16px">
        <Checkbox scale="xs" checked={understandsRecovery} onChange={(e) => setUnderstandsRecovery(e.target.checked)} />
        <Text ml="8px" fontSize="12px">
          {t(`I understand that if I close this window without the code, I won't be able to recover it.`)}
        </Text>
      </Flex>
      <Button
        width="100%"
        disabled={!allChecked}
        onClick={() => {
          setView(WalletView.GIFTS)
          setViewState(ViewState.WALLET_INFO)
        }}
      >
        {t('View All Gifts')}
      </Button>
    </>
  )
}
