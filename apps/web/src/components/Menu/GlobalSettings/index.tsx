import { ButtonProps, CogIcon, Flex, IconButton, ModalV2, useModalV2 } from '@pancakeswap/uikit'

import GlobalSettingsModal from './SettingsModal'

type Props = {
  color?: string
  mr?: string
  overrideButton?: (onClick: () => void) => React.ReactNode
} & ButtonProps

const GlobalSettings = ({ color, mr = '8px', overrideButton, ...rest }: Props) => {
  const { isOpen, setIsOpen, onDismiss } = useModalV2()

  const openModal = () => setIsOpen(true)

  return (
    <Flex>
      {overrideButton?.(openModal) || (
        <IconButton onClick={openModal} variant="text" scale="sm" mr={mr} id="open-settings-dialog-button" {...rest}>
          <CogIcon height={24} width={24} color={color || 'textSubtle'} />
        </IconButton>
      )}

      <ModalV2 isOpen={isOpen} onDismiss={onDismiss} closeOnOverlayClick>
        <GlobalSettingsModal onDismiss={onDismiss} />
      </ModalV2>
    </Flex>
  )
}

export default GlobalSettings
