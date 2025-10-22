import { useTranslation } from '@pancakeswap/localization'
import { Box, Card, CardBody, CardHeader, FlexGap, Text, IconButton, ArrowBackIcon } from '@pancakeswap/uikit'
import { styled } from 'styled-components'
import useTheme from 'hooks/useTheme'
import { logGTMIfoConnectWalletEvent } from 'utils/customGTMEventTracking'
import { useAccount } from 'wagmi'
import ConnectWalletButton from 'components/ConnectWalletButton'
import { useRouter } from 'next/router'
import { IfoDepositForm } from './IfoCards/IfoDepositForm'
import { IfoRibbon } from './IfoCards/IfoRibbon'
import useIfo from '../hooks/useIfo'

const Header = styled(CardHeader)<{ $bannerUrl: string }>`
  width: 100%;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  height: 64px;
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  background-color: ${({ theme }) => theme.colors.dropdown};
  background-image: ${({ $bannerUrl }) => `url('${$bannerUrl}')`};
`

const StyledCard = styled(Card)`
  width: 100%;
  margin: 0 auto;
  overflow: visible;

  ${({ theme }) => theme.mediaQueries.lg} {
    width: 737px;
  }
`

const StyledDepositCard = styled(Card)`
  width: 100%;
  margin: 0px;

  ${({ theme }) => theme.mediaQueries.lg} {
    width: 320px;
    margin: 32px auto 0;
  }
`

export const IfoDeposit: React.FC<{ pid: number }> = ({ pid }) => {
  const { info, config, users } = useIfo()
  const [userStatus0, userStatus1] = users
  const userStatus = pid === 0 ? userStatus0 : userStatus1
  const status = info?.status
  const bannerUrl = config?.bannerUrl ?? ''
  const { theme } = useTheme()

  if (status === 'coming_soon' || !userStatus) {
    return null
  }

  return (
    <StyledCard>
      <Box className="sticky-header" position="sticky" bottom="48px" width="100%" zIndex={6}>
        <Header $bannerUrl={bannerUrl} />
        <Box
          style={{
            background: theme.colors.gradientBubblegum,
            borderBottomLeftRadius: '24px',
            borderBottomRightRadius: '24px',
          }}
        >
          <IfoRibbon />
          <CardBody>
            <IfoDepositCard pid={pid} />
          </CardBody>
        </Box>
      </Box>
    </StyledCard>
  )
}

const IfoDepositCard = ({ pid }: { pid: number }) => {
  const { t } = useTranslation()
  const { address: account } = useAccount()
  const router = useRouter()
  const { pools, info } = useIfo()
  const poolInfo = pools?.[pid]
  const stakeCurrency = poolInfo?.stakeCurrency
  const status = info?.status

  const handleConnectWallet = () => {
    logGTMIfoConnectWalletEvent(status === 'coming_soon')
  }

  return (
    <StyledDepositCard>
      <CardBody>
        <FlexGap flexDirection="column">
          <IconButton scale="sm" variant="text" onClick={() => router.back()} my="24px">
            <ArrowBackIcon width="24px" color="textSubtle" />
          </IconButton>
          <Text fontSize="16px" bold textTransform="uppercase" color="secondary" mb="8px">
            {t('Deposit to %symbol% Pool', { symbol: stakeCurrency?.symbol })}
          </Text>
          {account ? (
            <IfoDepositForm pid={pid} />
          ) : (
            <ConnectWalletButton width="100%" onClickCapture={handleConnectWallet} />
          )}
        </FlexGap>
      </CardBody>
    </StyledDepositCard>
  )
}

export default IfoDeposit
