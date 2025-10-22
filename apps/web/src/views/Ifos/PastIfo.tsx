import { Container } from '@pancakeswap/uikit'

import { useInActiveIfoConfigs } from 'hooks/useIfoConfig'

import HistoryIfos from 'views/Cakepad/HistoryIfos'
import IfoCardV1Data from './components/IfoCardV1Data'
import IfoCardV2Data from './components/IfoCardV2Data'
import IfoCardV3Data from './components/IfoCardV3Data'
import { IfoCardV7Data } from './components/IfoCardV7Data'
import { IfoCardV8Data } from './components/IfoCardV8Data'

const PastIfo = ({ isV2 }: { isV2?: boolean }) => {
  const inactiveIfo = useInActiveIfoConfigs()

  return (
    <Container id="past-ifos" py={['24px', '24px', '40px']} maxWidth="736px" m="auto" width="100%">
      {isV2 && <HistoryIfos />}
      {inactiveIfo?.map((ifo) => {
        switch (ifo.version) {
          case 1:
            return <IfoCardV1Data key={ifo.id} ifo={ifo} isHistory />
          case 2:
            return <IfoCardV2Data key={ifo.id} ifo={ifo} isHistory />
          case 3:
          case 3.1:
          case 3.2:
            return <IfoCardV3Data key={ifo.id} ifo={ifo} isHistory />
          case 7:
            return <IfoCardV7Data key={ifo.id} ifo={ifo} isHistory />
          case 8:
            return <IfoCardV8Data key={ifo.id} ifo={ifo} isHistory />
          default:
            return null
        }
      })}
    </Container>
  )
}

export default PastIfo
