import { useCountdown } from '@pancakeswap/hooks'
import { IfoStatus } from '@pancakeswap/ifos'
import { useTranslation } from '@pancakeswap/localization'
import { Flex, Skeleton, Text } from '@pancakeswap/uikit'
import useTheme from 'hooks/useTheme'
import { styled } from 'styled-components'

interface Props {
  plannedStartTime: number
  startTime: number
  endTime: number
  ifoStatus: IfoStatus
  dark?: boolean
}

const FlexGap = styled(Flex)<{ gap: string }>`
  gap: ${({ gap }) => gap};
`

const CountDown: React.FC<{
  time: number
  textColor?: string
}> = ({ time, textColor }) => {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const color = textColor ?? theme.colors.secondary
  const { days, hours, minutes, seconds } = useCountdown(time) ?? { days: 0, hours: 0, minutes: 0, seconds: 0 }

  return (
    <FlexGap gap="4px" alignItems="baseline">
      {days ? (
        <Text fontSize="20px" bold color={color}>
          {days}
          {t('d')} :
        </Text>
      ) : null}
      {hours ? (
        <Text fontSize="20px" bold color={color}>
          {hours}
          {t('h')} :
        </Text>
      ) : null}
      <Text fontSize="20px" bold color={color}>
        {minutes ?? '0'}
        {t('m')} :
      </Text>
      <Text fontSize="20px" bold color={color}>
        {seconds}
        {t('s')}
      </Text>
    </FlexGap>
  )
}

export const SoonTimer: React.FC<React.PropsWithChildren<Props>> = ({ startTime, ifoStatus, plannedStartTime }) => {
  const { theme } = useTheme()
  const textColor = theme.colors.secondary
  const { t } = useTranslation()

  const countdownDisplay =
    ifoStatus !== 'idle' ? (
      <>
        <FlexGap gap="8px" alignItems="center">
          <Text fontSize="16px" color={textColor}>
            {t('Starts in')}:
          </Text>
          <CountDown time={startTime} />
        </FlexGap>
      </>
    ) : null

  const countdown = countdownDisplay

  return (
    <Flex justifyContent="center" position="relative">
      {ifoStatus === 'idle' ? <Skeleton animation="pulse" variant="rect" width="100%" height="48px" /> : countdown}
    </Flex>
  )
}

const LiveTimer: React.FC<React.PropsWithChildren<Pick<Props, 'endTime' | 'ifoStatus'>>> = ({ endTime, ifoStatus }) => {
  const { t } = useTranslation()

  const timeDisplay =
    ifoStatus !== 'idle' ? (
      <>
        <FlexGap gap="8px" alignItems="center">
          <Text textTransform="uppercase" fontSize="16px" bold color="#FBCB01">{`${t('Live Now')}!`}</Text>
          <Text color="white">{t('Ends in')}:</Text>
          <CountDown time={endTime} textColor="white" />
        </FlexGap>
      </>
    ) : null

  const timeNode = timeDisplay

  return (
    <Flex justifyContent="center" position="relative">
      {ifoStatus === 'idle' ? <Skeleton animation="pulse" variant="rect" width="100%" height="48px" /> : timeNode}
    </Flex>
  )
}

export default LiveTimer
