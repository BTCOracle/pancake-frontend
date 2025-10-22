import { useTranslation } from '@pancakeswap/localization'
import { Box, Flex, Heading, Progress, Text } from '@pancakeswap/uikit'
import { ReactNode } from 'react'
import { styled } from 'styled-components'

import { IfoStatus } from '@pancakeswap/ifos'
import useTheme from 'hooks/useTheme'
import { PublicIfoData } from '../../types'
import LiveTimer, { SoonTimer } from './Timer'

const StyledProgress = styled(Progress)`
  background-color: #281a5b;
`

const Container = styled(Box)`
  position: relative;
`

const BigCurve = styled(Box)<{ $status?: PublicIfoData['status']; $dark?: boolean }>`
  width: 150%;
  position: absolute;
  top: -150%;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1;

  ${({ $status, $dark, theme }) => {
    switch ($status) {
      case 'coming_soon':
        return `
          background: ${$dark ? '#322B48' : '#F6F4FB'};
        `
      case 'live':
        return `
          background: linear-gradient(269.16deg, #8051D6 14.87%, #492286 103.19%);
        `
      case 'finished':
        return `
          background: ${$dark ? '#9373E' : '#E0E0E0'};
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

  ${({ theme }) => theme.mediaQueries.sm} {
    left: unset;
    top: unset;
    right: 90px;
    bottom: 3px;
  }
`

export const IdoRibbon = ({
  ifoStatus,
  plannedStartTime,
  startTime,
  endTime,
  isClaimed,
  hasUserStaked,
}: {
  ifoStatus: IfoStatus
  plannedStartTime: number
  startTime: number
  endTime: number
  isClaimed?: boolean
  hasUserStaked?: boolean
}) => {
  const { isDark } = useTheme()

  let ribbon: ReactNode = null
  switch (ifoStatus) {
    case 'finished':
      ribbon = <IfoRibbonEnd isClaimed={isClaimed} hasUserStaked={hasUserStaked} />
      break
    case 'live':
      ribbon = <IfoRibbonLive endTime={endTime} ifoStatus={ifoStatus} dark={isDark} />
      break
    case 'coming_soon':
      ribbon = (
        <IfoRibbonSoon
          endTime={endTime}
          startTime={startTime}
          ifoStatus={ifoStatus}
          plannedStartTime={plannedStartTime}
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
      {/* {ifoStatus === 'live' && (
        <StyledProgress variant="flat">
          <ProgressBar
            $useDark
            $background="linear-gradient(273deg, #ffd800 -2.87%, #eb8c00 113.73%)"
            style={{ width: `${Math.min(Math.max(timeProgress, 0), 100)}%` }}
          />
        </StyledProgress>
      )} */}
      <Flex
        justifyContent="center"
        alignItems="center"
        flexDirection="column"
        minHeight={['48px', '48px', '48px', '48px']}
        position="relative"
        overflow="hidden"
        zIndex={1}
      >
        {ribbon}
      </Flex>
      {/* <ChainBoardContainer zIndex={2}>
        <IfoChainBoard chainId={ifoChainId} />
      </ChainBoardContainer> */}
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
      <BigCurve
        $status="finished"
        style={{ background: isClaimed ? theme.colors.success : hasUserStaked ? theme.colors.textSubtle : undefined }}
      />
      <RibbonContainer>
        <Text color={isClaimed || hasUserStaked ? 'white' : isDark ? '#39373E' : '#8D8D8D'}>
          {t('Sale Finished')}{' '}
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
        <Heading as="h3" scale="lg" color="secondary">
          <SoonTimer
            startTime={startTime}
            endTime={endTime}
            ifoStatus={ifoStatus}
            plannedStartTime={plannedStartTime}
            dark={dark}
          />
        </Heading>
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
