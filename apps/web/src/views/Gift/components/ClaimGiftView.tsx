import { useTranslation } from '@pancakeswap/localization'
import { Box, Button, ButtonMenu, Card, CardBody, Flex, FlexGap, Image, Input, Text } from '@pancakeswap/uikit'
import { useRouter } from 'next/router'
import { useTheme } from 'styled-components'
import ConnectWalletButton from 'components/ConnectWalletButton'
import { ViewState } from 'components/WalletModalV2/type'
import { useMemo } from 'react'
import { useAccount } from 'wagmi'
import { StyledButtonMenuItem } from 'components/Menu/UserMenu/WalletModal'
import { useGetGiftByCodeHash } from '../hooks/useGetGiftInfo'
import { useClaimGiftContext } from '../providers/ClaimGiftProvider'
import { GiftStatus } from '../types'
import { convertCodeHash } from '../utils/convertCodeHash'
import { isExpired } from '../utils/isExpired'

export const AuthRequiredClaimGiftView = ({ setViewState }: { setViewState: (viewState: ViewState) => void }) => {
  const { t } = useTranslation()
  const { code, setCode } = useClaimGiftContext()
  const theme = useTheme()
  const { pathname } = useRouter()
  const isInvitedGift = useMemo(() => {
    return pathname.startsWith('/invite')
  }, [pathname])

  const codeHash = convertCodeHash(code)

  const codeCannotConvertToHash = code && !codeHash

  const { data: giftInfo, isLoading, isError } = useGetGiftByCodeHash({ codeHash })

  // Check if gift is valid: must be pending and not expired
  const isValid = Boolean(giftInfo?.status === GiftStatus.PENDING && !isExpired(giftInfo.expiryTimestamp))

  const buttonText = useMemo(() => {
    if (!code) {
      return t('Claim')
    }

    if (isLoading) {
      return t('Checking...')
    }

    return t('Next.step')
  }, [isLoading, code, t])

  return (
    <>
      {!isInvitedGift && (
        <ButtonMenu
          scale="sm"
          variant="text"
          onItemClick={(index) =>
            index === 0 ? setViewState(ViewState.RECEIVE_QR) : setViewState(ViewState.CLAIM_GIFT)
          }
          activeIndex={1}
        >
          <StyledButtonMenuItem>{t('Address')}</StyledButtonMenuItem>
          <StyledButtonMenuItem>{t('Claim Gift')}</StyledButtonMenuItem>
        </ButtonMenu>
      )}
      <Card background={theme.colors.cardSecondary} mt="16px">
        <CardBody p="16px">
          <Text fontWeight={600} mb="4px" fontSize="16px">
            {t('Claim Gift')}
          </Text>
          <Text fontSize="14px" mb="8px" color="textSubtle">
            {t('If you have a gift code from a friend, enter it here to claim your gift token.')}
          </Text>
          <Box mb="16px">
            <Input
              id="claim-code"
              placeholder={t('Enter code')}
              scale="md"
              autoComplete="off"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              autoFocus
            />
            {code && (codeCannotConvertToHash || (!isLoading && (isError || !isValid))) ? (
              <Text color="destructive" mt="4px" fontSize="12px" bold>
                {t(
                  'The gift code you entered is invalid or expired. Please reach out to the gift creator for a new one.',
                )}
              </Text>
            ) : null}
          </Box>

          <Button width="100%" disabled={!isValid} onClick={() => setViewState(ViewState.CLAIM_GIFT_CONFIRM)}>
            {buttonText}
          </Button>
        </CardBody>
      </Card>
    </>
  )
}

export function ClaimGiftView(props) {
  const { address: account } = useAccount()

  const { t } = useTranslation()

  if (!account) {
    return (
      <Box py="16px">
        <Text fontSize="24px" fontWeight="600" mb="16px">
          {t('Ready to Claim Your Gift?')}
        </Text>

        <Text mb="16px">
          {t(
            `Someone just sent you a gift! Connect your wallet to get it, you're only one click away from claiming what’s yours.`,
          )}
        </Text>

        <Flex justifyContent="center" mb="16px">
          <Image src="/images/gifts/claim-gift-not-connected.png" alt="Claim Gift" width={185} height={185} />
        </Flex>

        <Card mb="16px">
          <FlexGap p="16px" flexDirection="column" gap="8px">
            <Flex>
              <Text fontWeight="bold" mr="8px">
                {t('Step 1:')}
              </Text>
              <Text color="textSubtle">{t('Connect your wallet')}</Text>
            </Flex>
            <Flex>
              <Text fontWeight="bold" mr="8px">
                {t('Step 2:')}
              </Text>
              <Text color="textSubtle">{t('Claim and enjoy!')}</Text>
            </Flex>
          </FlexGap>
        </Card>

        <ConnectWalletButton width="100%" />
      </Box>
    )
  }

  return <AuthRequiredClaimGiftView {...props} />
}
