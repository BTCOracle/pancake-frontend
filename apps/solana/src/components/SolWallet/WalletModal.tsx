import { ButtonMenu, ButtonMenuItem, InjectedModalProps, ModalHeader as UIKitModalHeader, MotionModal } from '@pancakeswap/uikit'
import { useState, useCallback } from 'react'
import { styled } from 'styled-components'
import { useTranslation } from '@pancakeswap/localization'
import { colors } from '@/theme/cssVariables'
import useResponsive from '@/hooks/useResponsive'
import WalletInfo from './WalletInfo'

export enum WalletView {
  WALLET_INFO,
  TRANSACTIONS,
  WRONG_NETWORK
}

interface WalletModalProps extends InjectedModalProps {
  initialView?: WalletView
}

const ModalHeader = styled(UIKitModalHeader)`
  background: ${colors.gradientBubblegum};
`

const Tabs = styled.div`
  background-color: ${colors.dropdown};
  border-bottom: 1px solid ${colors.cardBorder01};
  padding: 16px 24px;
`

interface TabsComponentProps {
  view: WalletView
  handleClick: (newIndex: number) => void
}

const TabsComponent: React.FC<React.PropsWithChildren<TabsComponentProps>> = ({ view, handleClick }) => {
  const { t } = useTranslation()

  return (
    <Tabs>
      <ButtonMenu scale="sm" variant="subtle" onItemClick={handleClick} activeIndex={view} fullWidth>
        <ButtonMenuItem>{t('Wallet')}</ButtonMenuItem>
        <ButtonMenuItem>{t('Transactions')}</ButtonMenuItem>
      </ButtonMenu>
    </Tabs>
  )
}

const WalletModal: React.FC<React.PropsWithChildren<WalletModalProps>> = ({ initialView = WalletView.WALLET_INFO, onDismiss }) => {
  const [view, setView] = useState(initialView)
  const { t } = useTranslation()
  const { isMobile } = useResponsive()

  const handleClick = useCallback((newIndex: number) => {
    setView(newIndex)
  }, [])

  return (
    <MotionModal title={t('Your Wallet')} maxWidth={[null, null, '500px']} headerPadding="2px 14px 0 24px" onDismiss={onDismiss}>
      {view === WalletView.WALLET_INFO && <WalletInfo onDismiss={onDismiss} />}
      {/* {view === WalletView.TRANSACTIONS && <WalletTransactions />} */}
    </MotionModal>
  )
}

export default WalletModal
