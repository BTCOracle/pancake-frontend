import { Flex, UserMenuItem, WarningIcon } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import { useAccount, useBalance } from 'wagmi'
import { parseEther } from 'viem'

// Define LOW_NATIVE_BALANCE here since we no longer import it from the old WalletModal
export const LOW_NATIVE_BALANCE = parseEther('0.002', 'wei')

interface WalletUserMenuItemProps {
  isWrongNetwork: boolean
  onPresentWalletModal: () => void
}

const WalletUserMenuItem: React.FC<React.PropsWithChildren<WalletUserMenuItemProps>> = ({
  isWrongNetwork,
  onPresentWalletModal,
}) => {
  const { t } = useTranslation()
  const { address: account } = useAccount()
  const { data, isFetched } = useBalance({ address: account })
  const hasLowNativeBalance = isFetched && data && data.value <= LOW_NATIVE_BALANCE

  return (
    <UserMenuItem as="button" onClick={onPresentWalletModal}>
      <Flex alignItems="center" justifyContent="space-between" width="100%">
        {t('Wallet')}
        {hasLowNativeBalance && !isWrongNetwork && <WarningIcon color="warning" width="24px" />}
        {isWrongNetwork && <WarningIcon color="failure" width="24px" />}
      </Flex>
    </UserMenuItem>
  )
}

export default WalletUserMenuItem
