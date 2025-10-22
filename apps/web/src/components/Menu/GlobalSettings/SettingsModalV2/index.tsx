import { useTranslation } from '@pancakeswap/localization'
import { AtomBox, Button, ButtonProps, ModalV2, MotionModal, NotificationDot, useModalV2 } from '@pancakeswap/uikit'

import { ReactNode, useCallback } from 'react'
import { useRoutingSettingChanged } from 'state/user/smartRouter'
import { NonEVMChainId } from '@pancakeswap/chains'
import { useActiveChainId } from 'hooks/useAccountActiveChain'
import { CustomizeRoutingTab } from './CustomizeRoutingTab'

export function RoutingSettingsModalContent({ onBack }: { onBack?: () => void }) {
  const { t } = useTranslation()
  return (
    <MotionModal
      title={t('Routing Settings')}
      headerBorderColor="transparent"
      bodyPadding="0 24px 24px"
      minWidth={[null, null, null, '400px']}
      minHeight="200px"
      onBack={onBack}
    >
      <CustomizeRoutingTab key="customize_routing_tab" />
    </MotionModal>
  )
}

export function RoutingSettingsButtonView({
  children,
  showRedDot = true,
  buttonProps,
  onClick,
}: {
  children?: ReactNode
  showRedDot?: boolean
  buttonProps?: ButtonProps
  onClick?: () => void
}) {
  const [isRoutingSettingChange] = useRoutingSettingChanged()
  const { t } = useTranslation()
  const { chainId } = useActiveChainId()

  if (chainId === NonEVMChainId.SOLANA) {
    return null
  }

  return (
    <AtomBox textAlign="center">
      <NotificationDot show={isRoutingSettingChange && showRedDot}>
        <Button variant="text" onClick={onClick} scale="sm" {...buttonProps}>
          {children || t('Customize Routing')}
        </Button>
      </NotificationDot>
    </AtomBox>
  )
}

export function RoutingSettingsButton({
  showRedDot = true,
  buttonProps,
  modalContent,
}: {
  children?: ReactNode
  showRedDot?: boolean
  buttonProps?: ButtonProps
  modalContent: ReactNode
}) {
  const { isOpen, setIsOpen, onDismiss } = useModalV2()

  return (
    <>
      <RoutingSettingsButtonView showRedDot={showRedDot} buttonProps={buttonProps} onClick={() => setIsOpen(true)} />
      <ModalV2 isOpen={isOpen} onDismiss={onDismiss} closeOnOverlayClick>
        {modalContent}
      </ModalV2>
    </>
  )
}

export const withCustomOnDismiss =
  (Component) =>
  ({ onDismiss, customOnDismiss, ...props }: { onDismiss?: () => void; customOnDismiss: () => void }) => {
    const handleDismiss = useCallback(() => {
      onDismiss?.()
      if (customOnDismiss) {
        customOnDismiss()
      }
    }, [customOnDismiss, onDismiss])

    return <Component {...props} onDismiss={handleDismiss} />
  }
