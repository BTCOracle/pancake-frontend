import { Ifo } from '@pancakeswap/ifos'

import useGetPublicIfoV8Data from 'views/Ifos/hooks/v8/useGetPublicIfoData'
import useGetWalletIfoV8Data from 'views/Ifos/hooks/v8/useGetWalletIfoData'

import IfoFoldableCard from './IfoFoldableCard'

interface Props {
  ifo: Ifo
  isHistory?: boolean
}

export const IfoCardV8Data: React.FC<React.PropsWithChildren<Props>> = ({ ifo, isHistory }) => {
  const publicIfoData = useGetPublicIfoV8Data(ifo)
  const walletIfoData = useGetWalletIfoV8Data(ifo)

  return <IfoFoldableCard ifo={ifo} publicIfoData={publicIfoData} walletIfoData={walletIfoData} isHistory={isHistory} />
}
