import { useTranslation } from '@pancakeswap/localization'
import { Flex, InjectedModalProps, Modal } from '@pancakeswap/uikit'
import { styled } from 'styled-components'
import GlobalSettings from './GlobalSettings'

const ScrollableContainer = styled(Flex)`
  flex-direction: column;
  height: auto;
  ${({ theme }) => theme.mediaQueries.xs} {
    max-height: 90vh;
  }
  ${({ theme }) => theme.mediaQueries.md} {
    max-height: none;
  }
`

const GlobalSettingsModal: React.FC<React.PropsWithChildren<InjectedModalProps>> = ({ onDismiss }) => {
  const { t } = useTranslation()

  return (
    <Modal title={t('Settings')} headerBackground="gradientCardHeader" onDismiss={onDismiss}>
      <ScrollableContainer>
        <GlobalSettings />
      </ScrollableContainer>
    </Modal>
  )
}

export default GlobalSettingsModal
