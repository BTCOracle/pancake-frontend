import { useTranslation } from '@pancakeswap/localization'
import {
  FlexGap,
  Button,
  CloseIcon,
  Column,
  Heading,
  IconButton,
  RowBetween,
  SocialLoginDiscordIcon,
  SocialLoginTelegramIcon,
  SocialLoginXIcon,
  Text,
  useMatchBreakpoints,
  ArrowBackIcon,
} from '@pancakeswap/uikit'
import styled from 'styled-components'
import { ASSET_CDN } from '../config/url'

interface SocialLoginProps {
  onGoogleLogin?: () => void
  onXLogin?: () => void
  onTelegramLogin?: () => void
  onDiscordLogin?: () => void

  onDismiss?: () => void
}

const SocialLoginButton = styled(Button)`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 12px;
  border-radius: 16px;
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  box-shadow: 0px 2px 0px 0px ${({ theme }) => theme.colors.cardBorder};
  gap: 4px;
  height: 56px;
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
  height: 32px;
  width: 32px;
  margin-bottom: 4px;
  svg {
    width: 32px;
    height: 32px;
  }
`

const NoticeCard = styled.div`
  background-color: ${({ theme }) => theme.colors.cardSecondary};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: 16px;
  padding: 12px;
  margin-bottom: 16px;

  display: flex;
  flex-direction: column;
  align-items: center;

  width: 100%;
`

const SocialLogin: React.FC<SocialLoginProps> = ({
  onGoogleLogin,
  onXLogin,
  onTelegramLogin,
  onDiscordLogin,
  onDismiss,
}) => {
  const { t } = useTranslation()
  const { isMobile } = useMatchBreakpoints()

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

  return (
    <>
      {isMobile ? (
        <RowBetween>
          <Heading color="color" as="h4">
            {t('Connect to PancakeSwap')}
          </Heading>
          <IconButton variant="text" onClick={onDismiss} mr="-12px">
            <CloseIcon />
          </IconButton>
        </RowBetween>
      ) : null}
      <Column gap="12px">
        <SocialLoginButton onClick={handleGoogleLogin}>
          <img
            src={`${ASSET_CDN}/web/wallets/social-login/google.jpg`}
            width="32"
            height="32"
            alt="Google"
            style={{ borderRadius: '8px' }}
          />
          <Text>{t('Continue with Google')}</Text>
        </SocialLoginButton>

        <FlexGap gap="8px" width="100%">
          <SocialLoginButtonVertical onClick={handleXLogin}>
            <IconWrapper>
              <SocialLoginXIcon />
            </IconWrapper>
            <Text style={{ whiteSpace: 'nowrap' }}>{t('X Login')}</Text>
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
        </FlexGap>
      </Column>
      {isMobile ? (
        <>
          <Divider>
            <Text color="textSubtle" style={{ transform: 'translateY(-12px)' }}>
              {t('or')}
            </Text>
          </Divider>
          <NoticeCard onClick={onDismiss}>
            <FlexGap gap="4px">
              <ArrowBackIcon />
              <Text>{t('Continue with Web3 Wallet')}</Text>
            </FlexGap>
          </NoticeCard>
        </>
      ) : null}
    </>
  )
}

const Divider = styled.div`
  height: 1px;
  background-color: ${({ theme }) => theme.colors.cardBorder};
  width: 100%;
  margin: 16px 0;
  text-align: center;
`

export default SocialLogin
