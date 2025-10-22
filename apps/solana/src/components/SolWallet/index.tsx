import { Box } from '@chakra-ui/react'
import { Button, Flex, LogoutIcon, ModalV2, useModalV2, UserMenu, UserMenuDivider, UserMenuItem } from '@pancakeswap/uikit'
import { Wallet, useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { useCallback, useMemo } from 'react'
import { useTranslation } from '@pancakeswap/localization'
import { WALLET_STORAGE_KEY } from '@/hooks/app/useInitConnection'
import { useEvent } from '@/hooks/useEvent'
import { useAppStore } from '@/store/useAppStore'
import SelectWalletModal from './SelectWalletModal'
import WalletModal, { WalletView } from './WalletModal'

const UserMenuItems: React.FC<{
  onPresentWalletModal: () => void
  onPresentTransactionModal: () => void
}> = ({ onPresentWalletModal, onPresentTransactionModal }) => {
  const { t } = useTranslation()
  const { disconnect } = useWallet()

  return (
    <>
      <UserMenuItem as="button" onClick={onPresentWalletModal}>
        <Flex alignItems="center" justifyContent="space-between" width="100%">
          {t('Wallet')}
          {/* {hasLowNativeBalance && <WarningIcon color="warning" width="24px" />} */}
        </Flex>
      </UserMenuItem>
      {/* <UserMenuItem as="button" onClick={onPresentTransactionModal}>
        {t('Recent Transactions')}
      </UserMenuItem> */}
      <UserMenuDivider />
      <UserMenuItem as="button" onClick={disconnect}>
        <Flex alignItems="center" justifyContent="space-between" width="100%">
          {t('Disconnect')}
          <LogoutIcon />
        </Flex>
      </UserMenuItem>
    </>
  )
}

export default function SolWallet() {
  const { wallets, select, connected, connecting, wallet } = useWallet()

  const { t } = useTranslation()
  const publicKey = useAppStore((s) => s.publicKey)
  const { setVisible, visible } = useWalletModal()

  const handleClose = useCallback(() => setVisible(false), [setVisible])
  const handleOpen = useCallback(() => setVisible(true), [setVisible])

  const handleSelectWallet = useEvent((wallet_: Wallet) => {
    select(wallet_.adapter.name)
    handleClose()
    setTimeout(() => {
      // remove before connected
      localStorage.removeItem(WALLET_STORAGE_KEY)
    }, 0)
  })

  const { isOpen: isTransactionModalOpen, setIsOpen: setTransactionModalOpen, onDismiss: dismissTransactionModal } = useModalV2()
  const { isOpen: isWalletModalOpen, setIsOpen: setWalletModalOpen, onDismiss: dismissWalletModal } = useModalV2()

  const accountText = useMemo(() => {
    const account = publicKey?.toBase58()
    return account ? `${account.substring(0, 2)}...${account.substring(account.length - 2)}` : null
  }, [publicKey])

  if (connected)
    return (
      <>
        <UserMenu avatarSrc={wallet ? wallet.adapter.icon : undefined} text={accountText} account={publicKey?.toBase58()} variant="default">
          {({ isOpen }) =>
            isOpen ? (
              <UserMenuItems
                onPresentWalletModal={() => setWalletModalOpen(true)}
                onPresentTransactionModal={() => setTransactionModalOpen(true)}
              />
            ) : (
              <></>
            )
          }
        </UserMenu>
        <ModalV2 isOpen={isWalletModalOpen} onDismiss={dismissWalletModal} closeOnOverlayClick maxWidth="320px" minHeight="500px">
          <WalletModal initialView={WalletView.WALLET_INFO} onDismiss={dismissWalletModal} />
        </ModalV2>
        <ModalV2 isOpen={isTransactionModalOpen} onDismiss={dismissTransactionModal} closeOnOverlayClick maxWidth="320px" minHeight="500px">
          <WalletModal initialView={WalletView.TRANSACTIONS} onDismiss={dismissTransactionModal} />
        </ModalV2>
      </>
    )
  return (
    <Box>
      <Button isLoading={connecting} onClick={handleOpen} scale="sm" width="auto">
        <Box display={['none', null, null, 'block']}>{t('Connect Wallet')}</Box>
        <Box display={['block', null, null, 'none']}>{t('Connect')}</Box>
      </Button>
      <SelectWalletModal wallets={wallets} isOpen={visible} onClose={handleClose} onSelectWallet={handleSelectWallet} />
    </Box>
  )
}
