import useGetPublicIfoV2Data from 'views/Ifos/hooks/v2/useGetPublicIfoData'
import useGetWalletIfoV2Data from 'views/Ifos/hooks/v2/useGetWalletIfoData'
import { Ifo } from '@pancakeswap/ifos'
import IfoFoldableCard from './IfoFoldableCard'

interface Props {
  ifo: Ifo
  isHistory?: boolean
}

const IfoCardV2Data: React.FC<React.PropsWithChildren<Props>> = ({ ifo, isHistory }) => {
  const publicIfoData = useGetPublicIfoV2Data(ifo)
  const walletIfoData = useGetWalletIfoV2Data(ifo)

  return <IfoFoldableCard ifo={ifo} publicIfoData={publicIfoData} walletIfoData={walletIfoData} isHistory={isHistory} />
}

export default IfoCardV2Data
