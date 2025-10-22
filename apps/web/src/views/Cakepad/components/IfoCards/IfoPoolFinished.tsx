import { FlexGap } from '@pancakeswap/uikit'
import type { IFOStatus } from '../../hooks/ifo/useIFOStatus'
import { ClaimDisplay } from './ClaimDisplay'
import { Divider } from './Divider'
import IfoPoolInfoDisplay from './IfoPoolInfoDisplay'
import useIfo from '../../hooks/useIfo'

export const IfoPoolFinished: React.FC<{ pid: number; ifoStatus: IFOStatus }> = ({ ifoStatus, pid }) => {
  const { users } = useIfo()
  const userStatus = users[pid]
  const userHasStaked = userStatus?.stakedAmount?.greaterThan(0)

  return (
    <FlexGap flexDirection="column" gap="8px">
      <ClaimDisplay pid={pid} />

      {userHasStaked && <Divider />}
      <IfoPoolInfoDisplay pid={pid} ifoStatus={ifoStatus} variant="finished" />
    </FlexGap>
  )
}

export default IfoPoolFinished
