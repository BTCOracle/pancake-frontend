import { SUPPORTED_CHAIN_IDS } from '@pancakeswap/ifos'

import IfoProvider from 'views/Ifos/contexts/IfoContext'
import dynamic from 'next/dynamic'
import { NextPageWithLayout } from 'utils/page.types'
import PastIfo from 'views/Ifos/PastIfo'
import { PageMeta } from 'components/Layout/Page'
import { useIfoConfigs } from 'views/Cakepad/hooks/useIfoConfigs'

const View = () => {
  useIfoConfigs()

  return (
    <>
      <PageMeta />
      <IfoProvider>
        <PastIfo isV2 />
      </IfoProvider>
    </>
  )
}
const PastIfoPage = dynamic(() => Promise.resolve(View), {
  ssr: false,
}) as NextPageWithLayout

PastIfoPage.chains = [...SUPPORTED_CHAIN_IDS]

export default PastIfoPage
