import { useTranslation } from '@pancakeswap/localization'
import { Box, Flex, LogoIcon, Modal, ModalV2 } from '@pancakeswap/uikit'

import { QRCodeSVG } from 'qrcode.react'
import { styled } from 'styled-components'
import QRCodeCopyButton from './QRCodeCopyButton'

interface ReceiveModalProps {
  account: string
  onDismiss: () => void
  isOpen: boolean
}

const QRCodeWrapper = styled(Box)`
  padding: 0px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
`

const QRCode = styled(Box)`
  width: 100%;
  height: auto;
  background-color: white;
  border-radius: 24px;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  overflow: hidden;
`

export const ReceiveContent: React.FC<{
  account: string
  chainType?: 'evm' | 'solana'
  walletIcon?: string
}> = ({ account, chainType, walletIcon }) => {
  return (
    <Flex flexDirection="column" alignItems="center" justifyContent="center" maxWidth="450px" mt="8px" mb="16px">
      <QRCodeCopyButton account={account} chainType={chainType} walletIcon={walletIcon} />

      <QRCodeWrapper>
        <QRCode>
          <Box position="relative">
            <QRCodeSVG
              value={account}
              size={330}
              level="H"
              includeMargin
              imageSettings={{
                src: '/images/tokens/pancakeswap-token.png',
                x: undefined,
                y: undefined,
                height: 48,
                width: 48,
                excavate: true,
              }}
            />
            <Box
              position="absolute"
              top="50%"
              left="50%"
              style={{ transform: 'translate(-50%, -50%)' }}
              background="white"
            >
              <LogoIcon width="40px" />
            </Box>
          </Box>
        </QRCode>
      </QRCodeWrapper>
    </Flex>
  )
}

const ReceiveModal: React.FC<React.PropsWithChildren<ReceiveModalProps>> = ({ account, onDismiss, isOpen }) => {
  const { t } = useTranslation()

  return (
    <ModalV2 isOpen={isOpen} onDismiss={onDismiss} closeOnOverlayClick>
      <Modal title={t('Receive crypto')}>
        <ReceiveContent account={account} />
      </Modal>
    </ModalV2>
  )
}

export default ReceiveModal
