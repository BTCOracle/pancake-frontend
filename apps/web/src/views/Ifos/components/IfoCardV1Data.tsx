import useGetPublicIfoV1Data from 'views/Ifos/hooks/v1/useGetPublicIfoData'
import useGetWalletIfoV1Data from 'views/Ifos/hooks/v1/useGetWalletIfoData'
import { Ifo } from '@pancakeswap/ifos'
import IfoFoldableCard from './IfoFoldableCard'

interface Props {
  ifo: Ifo
  isHistory?: boolean
}

const IfoCardV1Data: React.FC<React.PropsWithChildren<Props>> = ({ ifo, isHistory }) => {
  const publicIfoData = useGetPublicIfoV1Data(ifo)
  const walletIfoData = useGetWalletIfoV1Data(ifo)

  return <IfoFoldableCard ifo={ifo} publicIfoData={publicIfoData} walletIfoData={walletIfoData} isHistory={isHistory} />
}

export default IfoCardV1Data
