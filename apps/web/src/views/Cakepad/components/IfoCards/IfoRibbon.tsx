import { useTranslation } from '@pancakeswap/localization'
import { Box, Flex, Progress, ProgressBar, Text } from '@pancakeswap/uikit'
import { ReactNode, useMemo, useState, useEffect } from 'react'
import { styled } from 'styled-components'

import { IfoStatus } from '@pancakeswap/ifos'
import { ChainId } from '@pancakeswap/chains'
import useTheme from 'hooks/useTheme'
import { IfoChainBoard } from 'views/Ifos/components/IfoChainBoard'
import LiveTimer, { SoonTimer } from './Timer'
import useIfo from '../../hooks/useIfo'

const StyledProgress = styled(Progress)`
  background-color: #281a5b;
`

const Container = styled(Box)`
  position: relative;
  overflow: visible;
`

const BigCurve = styled.div<{ $status?: IfoStatus; $dark?: boolean }>`
  width: 150%;
  position: absolute;
  top: -150%;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1;

  ${({ theme }) => theme.mediaQueries.md} {
    border-radius: 50%;
  }

  ${({ $status, $dark, theme }) => {
    switch ($status) {
      case 'coming_soon':
        return `
          background: ${$dark ? '#353547' : '#EFF3F4'};
        `
      case 'live':
        return `
          background: linear-gradient(180deg, #8051D6 0%, #492286 100%);
        `
      case 'finished':
        return `
          background: ${theme.colors.input};
        `
      default:
        return ''
    }
  }}
`

const RibbonContainer = styled(Box)`
  z-index: 2;
  position: relative;
`

const ChainBoardContainer = styled(Box)`
  position: absolute;
  top: -4rem;
  left: 50%;
  transform: translateX(-50%);

  ${({ theme }) => theme.mediaQueries.sm} {
    left: unset;
    top: unset;
    right: 90px;
    bottom: -3px;
    transform: rotate(1.5deg);
  }
`

export const IfoRibbon: React.FC<{ isHistory?: boolean }> = ({ isHistory = false }) => {
  const { isDark } = useTheme()
  const { info, users } = useIfo()
  const ifoStatus = info?.status
  const startTimestamp = info?.startTimestamp
  const endTimestamp = info?.endTimestamp
  const [userStatus0, userStatus1] = users
  const [currentTime, setCurrentTime] = useState(() => Math.floor(Date.now() / 1000))

  // Update current time every second for live progress
  useEffect(() => {
    if (ifoStatus !== 'live') return undefined
    const timer = setInterval(() => {
      setCurrentTime(Math.floor(Date.now() / 1000))
    }, 1000)
    return () => clearInterval(timer)
  }, [ifoStatus])

  const hasUserStaked = userStatus0?.stakedAmount?.greaterThan(0) || userStatus1?.stakedAmount?.greaterThan(0)

  const isClaimed = useMemo(() => {
    if (!userStatus0 && !userStatus1) return false
    if (userStatus0?.claimableAmount?.greaterThan(0) && userStatus1?.claimableAmount?.greaterThan(0))
      return userStatus0.claimed && userStatus1.claimed
    return userStatus0?.claimed || userStatus1?.claimed
  }, [userStatus0, userStatus1])

  const timeProgress = useMemo(() => {
    if (ifoStatus !== 'live' || !startTimestamp || !endTimestamp) return 0
    const totalDuration = endTimestamp - startTimestamp
    const elapsed = currentTime - startTimestamp
    if (elapsed <= 0) return 0
    if (elapsed >= totalDuration) return 100
    return Math.min((elapsed / totalDuration) * 100, 100)
  }, [ifoStatus, startTimestamp, endTimestamp, currentTime])

  let ribbon: ReactNode = null
  switch (ifoStatus) {
    case 'finished':
      ribbon = <IfoRibbonEnd isClaimed={isClaimed} hasUserStaked={hasUserStaked} />
      break
    case 'live':
      ribbon = <IfoRibbonLive endTime={endTimestamp ?? 0} ifoStatus={ifoStatus} dark={isDark} />
      break
    case 'coming_soon':
      ribbon = (
        <IfoRibbonSoon
          endTime={endTimestamp ?? 0}
          startTime={startTimestamp ?? 0}
          ifoStatus={ifoStatus}
          plannedStartTime={startTimestamp ?? 0}
          dark={isDark}
        />
      )
      break
    default:
      ribbon = null
  }

  if (ifoStatus === 'idle') {
    return null
  }

  return (
    <Container>
      {ifoStatus === 'live' && (
        <StyledProgress variant="flat">
          <ProgressBar
            $useDark={isDark}
            $background="linear-gradient(273deg, #ffd800 -2.87%, #eb8c00 113.73%)"
            style={{
              width: `${Math.min(timeProgress, 100)}%`,
            }}
          />
        </StyledProgress>
      )}
      <Flex
        justifyContent="center"
        alignItems="center"
        flexDirection="column"
        minHeight={['60px', '60px', '60px', '60px']}
        position="relative"
        overflow="hidden"
        zIndex={1}
      >
        {ribbon}
      </Flex>
      <ChainBoardContainer zIndex={2}>
        <IfoChainBoard chainId={ChainId.BSC} isHistory={isHistory} />
      </ChainBoardContainer>
    </Container>
  )
}

type RibbonProps = {
  dark?: boolean
}

const IfoRibbonEnd: React.FC<{
  isClaimed?: boolean
  hasUserStaked?: boolean
}> = ({ isClaimed, hasUserStaked }) => {
  const { t } = useTranslation()
  const { isDark, theme } = useTheme()
  return (
    <>
      <BigCurve $status="finished" $dark={isDark} style={{ background: theme.colors.input }} />
      <RibbonContainer>
        <Text fontSize={['16px', '16px', '24px']} fontFamily="Kanit" color="textSubtle" bold>
          {t('CAKE.PAD Ended')}{' '}
          {isClaimed ? <> & {t('Claimed')}</> : hasUserStaked ? <> - {t('Claim available!')}</> : ''}
        </Text>
      </RibbonContainer>
    </>
  )
}

const IfoRibbonSoon = ({
  startTime,
  ifoStatus,
  plannedStartTime,
  dark,
  endTime,
}: { plannedStartTime: number; startTime: number; endTime: number; ifoStatus: IfoStatus } & RibbonProps) => {
  return (
    <>
      <BigCurve $status="coming_soon" $dark={dark} />
      <RibbonContainer>
        <SoonTimer
          startTime={startTime}
          endTime={endTime}
          ifoStatus={ifoStatus}
          plannedStartTime={plannedStartTime}
          dark={dark}
        />
      </RibbonContainer>
    </>
  )
}

const IfoRibbonLive = ({ ifoStatus, dark, endTime }: { endTime: number; ifoStatus: IfoStatus } & RibbonProps) => {
  return (
    <>
      <BigCurve $status="live" $dark={dark} />
      <RibbonContainer>
        <LiveTimer endTime={endTime} ifoStatus={ifoStatus} />
      </RibbonContainer>
    </>
  )
}
