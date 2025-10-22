import { Box, Flex } from '@pancakeswap/uikit'
import { styled } from 'styled-components'

import { IfoStatus } from '@pancakeswap/ifos'
import { ChainId } from '@pancakeswap/chains'
import useTheme from 'hooks/useTheme'
import { IfoChainBoard } from 'views/Ifos/components/IfoChainBoard'
import useIfo from 'views/Cakepad/hooks/useIfo'
import { SoonTimer } from '../Timer'

const Container = styled(Box)`
  position: relative;
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

export const IfoPresetRibbon: React.FC = () => {
  const { isDark } = useTheme()
  const { config } = useIfo()

  const ifoStatus = 'coming_soon'
  const startTimestamp = config?.presetData?.startTimestamp
  const endTimestamp = config?.presetData?.endTimestamp

  return (
    <Container
      style={{
        overflow: 'visible',
      }}
    >
      <Flex
        justifyContent="center"
        alignItems="center"
        flexDirection="column"
        minHeight={['48px', '48px', '48px', '48px']}
        position="relative"
        overflow="hidden"
        zIndex={1}
      >
        <IfoRibbonSoon
          endTime={endTimestamp ?? 0}
          startTime={startTimestamp ?? 0}
          ifoStatus={ifoStatus}
          plannedStartTime={startTimestamp ?? 0}
          dark={isDark}
        />
      </Flex>
      <ChainBoardContainer zIndex={2}>
        <IfoChainBoard chainId={ChainId.BSC} />
      </ChainBoardContainer>
    </Container>
  )
}

type RibbonProps = {
  dark?: boolean
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
