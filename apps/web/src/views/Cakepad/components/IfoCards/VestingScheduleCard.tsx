import { useTranslation } from '@pancakeswap/localization'
import { Card, CardBody, CardHeader, Flex, FlexGap, Text } from '@pancakeswap/uikit'
import dayjs from 'dayjs'
import { useMemo } from 'react'
import useTheme from 'hooks/useTheme'
import { styled } from 'styled-components'
import { useIFODuration } from '../../hooks/ifo/useIFODuration'
import { useVestingInfo } from '../../hooks/ifo/useVestingInfo'
import useIfo from '../../hooks/useIfo'

const Timeline = styled.div`
  position: relative;
  display: flex;
  justify-content: space-between;
  margin: 24px 0;
  &:before {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 2px;
    background-color: ${({ theme }) => theme.colors.cardBorder};
  }
`

const Milestone = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 1;
`

const Dot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.primary};
`

export const VestingScheduleCard: React.FC = () => {
  const { t } = useTranslation()
  const { theme, isDark } = useTheme()
  const { info } = useIfo()
  const offeringCurrency = info?.offeringCurrency
  const vesting = useVestingInfo()

  const vestingDuration = useIFODuration(vesting?.duration ?? 0)

  const releaseRate = useMemo(() => {
    if (!vesting) return undefined
    const rate = vesting.percentage / vesting.duration
    const rounded = rate >= 0.00001 ? rate.toFixed(5) : '< 0.00001'
    return `${rounded}%`
  }, [vesting])

  const format = (timestamp: number) => dayjs(timestamp).format('DD-MM-YY HH:mm')
  const ifoEnded = info?.endTimestamp ? format(info.endTimestamp * 1000) : '--'
  const cliff = vesting ? format((vesting.startTime + vesting.cliff) * 1000) : '--'
  const vestingEnd = vesting ? format((vesting.startTime + vesting.duration) * 1000) : '--'
  if (!vesting?.duration) {
    return null
  }

  return (
    <Card background={isDark ? '#18171A' : theme.colors.background} mb="16px">
      <CardHeader>
        <Text fontSize="20px" bold>
          {`${offeringCurrency?.symbol ?? ''} ${t('Vesting schedule')}`}
        </Text>
      </CardHeader>
      <CardBody>
        <FlexGap flexDirection="column" gap="8px">
          <Timeline>
            <Milestone>
              <Dot />
            </Milestone>
            <Milestone>
              <Dot />
            </Milestone>
            <Milestone>
              <Dot />
            </Milestone>
          </Timeline>
          <Flex justifyContent="space-between">
            <Text fontSize="12px" bold>{`${t('CAKE.PAD ended')} (${ifoEnded})`}</Text>
            <Text fontSize="12px" bold>{`${t('Cliff')} (${cliff})`}</Text>
            <Text fontSize="12px" bold>{`${t('Vesting end')} (${vestingEnd})`}</Text>
          </Flex>
          <FlexGap flexDirection="column" gap="8px">
            <FlexGap justifyContent="space-between">
              <Text color="textSubtle">{t('Release rate')}</Text>
              <Text>{releaseRate ? t('%releaseRate% per second', { releaseRate }) : '--'}</Text>
            </FlexGap>
            <FlexGap justifyContent="space-between">
              <Text color="textSubtle">{t('Vesting duration')}</Text>
              <Text>{vestingDuration || '--'}</Text>
            </FlexGap>
            <FlexGap justifyContent="space-between">
              <Text color="textSubtle">{t('Fully released date')}</Text>
              <Text>{vestingEnd}</Text>
            </FlexGap>
          </FlexGap>
        </FlexGap>
      </CardBody>
    </Card>
  )
}

export default VestingScheduleCard
