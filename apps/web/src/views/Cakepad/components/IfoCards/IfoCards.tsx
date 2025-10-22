import { Box, Card, CardBody, CardHeader, Spinner } from '@pancakeswap/uikit'
import { styled } from 'styled-components'
import useTheme from 'hooks/useTheme'

import { useIFOStatus } from '../../hooks/ifo/useIFOStatus'
import useIfo from '../../hooks/useIfo'
import { Footer } from '../Footer'
import { IfoRibbon } from './IfoRibbon'
import { IfoCardComing } from './IfoCardComing'
import { IfoCardLive } from './IfoCardLive'
import { IfoCardFinished } from './IfoCardFinished'
import { IfoCardIdle } from './IfoCardIdle'

// V2 Header component with IFO v1 style - uses bannerUrl directly
export const Header = styled(CardHeader)<{ $bannerUrl: string; $isCurrent?: boolean }>`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  height: ${({ $isCurrent }) => ($isCurrent ? '64px' : '112px')};
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  border-top-left-radius: 32px;
  border-top-right-radius: 32px;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.2) 100%),
    ${({ $bannerUrl }) => `url('${$bannerUrl}')`};
  background-size: cover;
  background-position: center;
  ${({ theme }) => theme.mediaQueries.md} {
    height: 112px;
  }
`

export const StyledCard = styled(Card)`
  width: 100%;
  margin: 0 auto;
  border-top-left-radius: 32px;
  border-top-right-radius: 32px;
  overflow: visible;

  ${({ theme }) => theme.mediaQueries.lg} {
    width: 737px;
  }
`

export const IfoCurrentCard = ({ bannerUrl }: { ifoId: string; bannerUrl: string }) => {
  const { info } = useIfo()
  const { theme } = useTheme()

  if (!info) {
    return <Spinner />
  }

  return (
    <StyledCard>
      <Box className="sticky-header" position="sticky" bottom="48px" width="100%" zIndex={6}>
        <Header $isCurrent $bannerUrl={bannerUrl} />
        <Box
          style={{
            background: theme.colors.gradientBubblegum,
          }}
        >
          <IfoRibbon />
          <IfoCard />
        </Box>
      </Box>
      <Footer />
    </StyledCard>
  )
}

const IfoCard: React.FC = () => {
  const { info } = useIfo()
  const [ifoStatus0, ifoStatus1] = useIFOStatus()
  const ifoStatus = info?.status

  let content: JSX.Element
  switch (ifoStatus) {
    case 'coming_soon':
      content = <IfoCardComing />
      break
    case 'live':
      content = <IfoCardLive ifoStatus0={ifoStatus0} ifoStatus1={ifoStatus1} />
      break
    case 'finished':
      content = <IfoCardFinished ifoStatus0={ifoStatus0} ifoStatus1={ifoStatus1} />
      break
    case 'idle':
    default:
      content = <IfoCardIdle ifoStatus0={ifoStatus0} ifoStatus1={ifoStatus1} />
      break
  }

  return <CardBody>{content}</CardBody>
}
