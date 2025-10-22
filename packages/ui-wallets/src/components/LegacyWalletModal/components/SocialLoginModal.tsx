import { useTranslation } from '@pancakeswap/localization'
import {
  ArrowBackIcon,
  Button,
  CloseIcon,
  FlexGap as Flex,
  Heading,
  IconButton,
  ModalV2,
  ModalWrapper,
  SocialLoginDiscordIcon,
  SocialLoginTelegramIcon,
  SocialLoginXIcon,
  Text,
} from '@pancakeswap/uikit'
import { MouseEvent } from 'react'
import styled from 'styled-components'

const ASSET_CDN = 'https://assets.pancakeswap.finance'

interface SocialLoginModalProps {
  isOpen: boolean
  onDismiss: () => void
  onGoogleLogin?: () => void
  onXLogin?: () => void
  onTelegramLogin?: () => void
  onDiscordLogin?: () => void
  onBackToWeb3Wallet?: () => void
}

const StyledModalWrapper = styled(ModalWrapper)`
  width: 100%;

  z-index: 1401;
  ${({ theme }) => theme.mediaQueries.md} {
    max-width: 360px;
  }
`

const StyledModalContainer = styled(Flex)`
  flex-direction: column;
  padding: 24px;
`

const SocialLoginButton = styled(Button)`
  width: 100%;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 20px 16px;
  border-radius: 12px;
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  box-shadow: 0px 2px 0px 0px ${({ theme }) => theme.colors.cardBorder};
  gap: 8px;
`

const SocialLoginButtonVertical = styled(SocialLoginButton)`
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 12px;
  min-height: 100px;
`

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 24px;
  width: 24px;
  margin-bottom: 8px;
  svg {
    width: 24px;
    height: 24px;
  }
`

const Divider = styled.div`
  height: 1px;
  background-color: ${({ theme }) => theme.colors.cardBorder};
  width: 100%;
  margin: 16px 0;
  text-align: center;
`

const Web3WalletButton = styled(SocialLoginButton)`
  background-color: ${({ theme }) => theme.colors.cardSecondary};
  border: none;
`

const SocialLoginModal: React.FC<SocialLoginModalProps> = ({
  isOpen,
  onDismiss,
  onGoogleLogin,
  onXLogin,
  onTelegramLogin,
  onDiscordLogin,
  onBackToWeb3Wallet,
}) => {
  const { t } = useTranslation()

  const handleGoogleLogin = () => {
    onGoogleLogin?.()
  }

  const handleXLogin = () => {
    onXLogin?.()
  }

  const handleTelegramLogin = () => {
    onTelegramLogin?.()
  }

  const handleDiscordLogin = () => {
    onDiscordLogin?.()
  }

  const handleWeb3WalletLogin = () => {
    onBackToWeb3Wallet?.()
  }

  return (
    <ModalV2 isOpen={isOpen} onDismiss={onDismiss} closeOnOverlayClick>
      <StyledModalWrapper onDismiss={onDismiss}>
        <StyledModalContainer>
          <Flex justifyContent="space-between" alignItems="center" mb="24px">
            <Heading as="h3">{t('Social Login')}</Heading>
            <IconButton
              variant="text"
              onClick={(e: MouseEvent<HTMLButtonElement>) => {
                e.stopPropagation()
                onDismiss()
              }}
              aria-label="Close the dialog"
            >
              <CloseIcon color="textSubtle" />
            </IconButton>
          </Flex>

          <Text color="textSubtle" mb="24px">
            {t('Connect with your social account for a seamless experience')}
          </Text>

          <SocialLoginButton onClick={handleGoogleLogin}>
            <img
              src={`${ASSET_CDN}/web/wallets/social-login/google.jpg`}
              width="24"
              height="24"
              alt="Google"
              style={{ borderRadius: '8px' }}
            />
            <Text>{t('Continue with Google')}</Text>
          </SocialLoginButton>

          <Flex gap="8px">
            <SocialLoginButtonVertical onClick={handleXLogin}>
              <IconWrapper>
                <SocialLoginXIcon />
              </IconWrapper>
              <Text>{t('X Login')}</Text>
            </SocialLoginButtonVertical>

            <SocialLoginButtonVertical onClick={handleTelegramLogin}>
              <IconWrapper>
                <SocialLoginTelegramIcon />
              </IconWrapper>
              <Text>{t('Telegram')}</Text>
            </SocialLoginButtonVertical>

            <SocialLoginButtonVertical onClick={handleDiscordLogin}>
              <IconWrapper>
                <SocialLoginDiscordIcon />
              </IconWrapper>
              <Text>{t('Discord')}</Text>
            </SocialLoginButtonVertical>
          </Flex>

          <Divider>
            <Text style={{ transform: 'translateY(-12px)' }}>{t('or')}</Text>
          </Divider>

          <Web3WalletButton onClick={handleWeb3WalletLogin}>
            <ArrowBackIcon />
            <Text>{t('Continue with Web3 Wallet')}</Text>
          </Web3WalletButton>
        </StyledModalContainer>
      </StyledModalWrapper>
    </ModalV2>
  )
}

export default SocialLoginModal
