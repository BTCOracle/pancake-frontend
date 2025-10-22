import { FlexGap } from '@pancakeswap/uikit'
import { ClaimedCard } from './ClaimedCard'
import { IfoSaleInfoCard } from './IfoSaleInfoCard'
import { IfoPoolLive } from './IfoPoolLive'
import { IfoVestingCard } from './IfoVestingCard'
import type { IFOStatus } from '../../hooks/ifo/useIFOStatus'
import useIfo from '../../hooks/useIfo'

const IfoCardIdle: React.FC<{ ifoStatus0: IFOStatus; ifoStatus1: IFOStatus }> = ({ ifoStatus0, ifoStatus1 }) => {
  const { pools } = useIfo()
  const pool0Info = pools[0]
  const pool1Info = pools[1]

  return (
    <>
      {pool0Info && <ClaimedCard pid={pool0Info.pid} />}
      {pool1Info && <ClaimedCard pid={pool1Info.pid} />}
      <IfoSaleInfoCard />
      <FlexGap flexDirection="column" gap="16px">
        {pool0Info && <IfoPoolLive pid={pool0Info.pid} ifoStatus={ifoStatus0} />}
        {pool1Info && <IfoPoolLive pid={pool1Info.pid} ifoStatus={ifoStatus1} />}
      </FlexGap>
      <IfoVestingCard />
    </>
  )
}

export { IfoCardIdle }
