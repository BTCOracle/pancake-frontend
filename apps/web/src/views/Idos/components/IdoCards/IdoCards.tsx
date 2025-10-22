import { Box, Card, CardBody, CardHeader, FlexGap, Spinner } from '@pancakeswap/uikit'
import { styled } from 'styled-components'

import { useMemo } from 'react'
import { useIDOStatus } from 'views/Idos/hooks/ido/usdIDOStatus'
import { useIDOConfig } from 'views/Idos/hooks/ido/useIDOConfig'
import { useIDOCurrencies } from 'views/Idos/hooks/ido/useIDOCurrencies'
import { useIDOPoolInfo } from 'views/Idos/hooks/ido/useIDOPoolInfo'
import { useIDOUserStatus } from 'views/Idos/hooks/ido/useIDOUserStatus'
import { Footer } from '../Footer'
import { ClaimedCard } from './ClaimedCard'
import { IdoRibbon } from './IdoRibbon'
import { IdoSaleInfoCard } from './IdoSaleInfoCard'
import { IdoStakeActionCard } from './IdoStakeActionCard'

export const StyledCardBody = styled(CardBody)`
  padding: 24px 16px;
  ${({ theme }) => theme.mediaQueries.md} {
    padding: 24px;
  }
`

const Header = styled(CardHeader)<{
  $isCurrent?: boolean
  $bannerUrl: string
}>`
  width: 100%;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  height: ${({ $isCurrent }) => ($isCurrent ? '64px' : '112px')};
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  background-color: ${({ theme }) => theme.colors.dropdown};
  background-image: ${({ $bannerUrl }) => `url('${$bannerUrl}')`};
`

export const Divider = styled.div`
  width: 100%;
  height: 1px;
  background-color: ${({ theme }) => theme.colors.cardBorder};
  margin: 8px 0 0 0;
`

export const IDoCurrentCard = ({ idoId, bannerUrl }: { idoId: string; bannerUrl: string }) => {
  const { status, duration, startTimestamp, endTimestamp } = useIDOConfig()
  const [userStatus0, userStatus1] = useIDOUserStatus()
  const { offeringCurrency } = useIDOCurrencies()
  const hasUserStaked = userStatus0?.stakedAmount?.greaterThan(0) || userStatus1?.stakedAmount?.greaterThan(0)
  const isClaimed = useMemo(() => {
    if (!userStatus0 && !userStatus1) return false
    if (userStatus0?.claimableAmount?.greaterThan(0) && userStatus1?.claimableAmount?.greaterThan(0))
      return userStatus0.claimed && userStatus1.claimed
    return userStatus0?.claimed || userStatus1?.claimed
  }, [userStatus0, userStatus1])

  if (!status || !offeringCurrency) {
    return <Spinner />
  }

  return (
    <Card style={{ width: '100%' }}>
      <Box className="sticky-header" position="sticky" bottom="48px" width="100%" zIndex={6}>
        <Header $isCurrent $bannerUrl={bannerUrl} />
        <IdoRibbon
          startTime={startTimestamp}
          plannedStartTime={startTimestamp}
          ifoStatus={status}
          endTime={endTimestamp}
          hasUserStaked={hasUserStaked}
          isClaimed={isClaimed}
        />
        <IdoCard />
      </Box>
      <Footer />
    </Card>
  )
}

export const IdoCard: React.FC = () => {
  const { data: poolInfo } = useIDOPoolInfo()
  const { pool0Info, pool1Info } = poolInfo ?? {}
  const [userStatus0, userStatus1] = useIDOUserStatus()
  const [idoStatus0, idoStatus1] = useIDOStatus()

  return (
    <CardBody>
      {pool0Info && <ClaimedCard userStatus={userStatus0} pid={pool0Info.pid} />}
      {pool1Info && <ClaimedCard userStatus={userStatus1} pid={pool1Info.pid} />}
      <IdoSaleInfoCard />
      <FlexGap flexDirection="column" gap="16px">
        {pool0Info && <IdoStakeActionCard pid={pool0Info.pid} userStatus={userStatus0} idoStatus={idoStatus0} />}
        {pool1Info && <IdoStakeActionCard pid={pool1Info.pid} userStatus={userStatus1} idoStatus={idoStatus1} />}
      </FlexGap>
    </CardBody>
  )
}
