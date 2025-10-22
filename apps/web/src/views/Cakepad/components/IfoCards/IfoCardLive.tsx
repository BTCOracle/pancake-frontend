import { Card, CardBody, FlexGap, useMatchBreakpoints } from '@pancakeswap/uikit'
import useTheme from 'hooks/useTheme'
import { IfoSaleInfoCard } from './IfoSaleInfoCard'
import { IfoPoolLive } from './IfoPoolLive'
import { VestingScheduleCard } from './VestingScheduleCard'
import type { IFOStatus } from '../../hooks/ifo/useIFOStatus'
import useIfo from '../../hooks/useIfo'

export const IfoCardLive: React.FC<{ ifoStatus0: IFOStatus; ifoStatus1: IFOStatus }> = ({ ifoStatus0, ifoStatus1 }) => {
  const { isDark, theme } = useTheme()
  const { isDesktop } = useMatchBreakpoints()
  const { pools } = useIfo()
  const pool0Info = pools[0]
  const pool1Info = pools[1]

  const stakeActionCards = (
    <Card
      style={{
        flex: '1',
      }}
      background={isDark ? '#18171A' : theme.colors.background}
      mb="16px"
    >
      <CardBody>
        <FlexGap flexDirection="column" gap="16px">
          {pool0Info && <IfoPoolLive pid={pool0Info.pid} ifoStatus={ifoStatus0} />}
          {pool1Info && <IfoPoolLive pid={pool1Info.pid} ifoStatus={ifoStatus1} />}
        </FlexGap>
      </CardBody>
    </Card>
  )

  return (
    <>
      {isDesktop ? (
        <FlexGap gap="16px" alignItems="flex-start">
          <FlexGap flexDirection="column" flex="1" gap="16px">
            <IfoSaleInfoCard />
            <VestingScheduleCard />
          </FlexGap>
          {stakeActionCards}
        </FlexGap>
      ) : (
        <>
          <IfoSaleInfoCard />
          {stakeActionCards}
        </>
      )}
    </>
  )
}
