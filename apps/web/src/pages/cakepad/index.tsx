import { ChainId } from '@pancakeswap/chains'

import IfoProvider from 'views/Ifos/contexts/IfoContext'
import { NextPageWithLayout } from 'utils/page.types'
import IfoLayout from 'views/Cakepad/components/IfoLayout'
import Hero from 'views/Cakepad/components/Hero'
import dynamic from 'next/dynamic'
import IFO from 'views/Cakepad/ifo'
import { PageMeta } from 'components/Layout/Page'
import { useIfoConfigs } from 'views/Cakepad/hooks/useIfoConfigs'

const IFO_SUPPORT_CHAINS = [ChainId.BSC, ChainId.BSC_TESTNET]

const View = () => {
  useIfoConfigs()

  return (
    <>
      <PageMeta />
      <IfoProvider>
        <Hero />
        <IFO />
      </IfoProvider>
    </>
  )
}

const CurrentIfoPage: NextPageWithLayout = dynamic(() => Promise.resolve(View), {
  ssr: false,
})

CurrentIfoPage.chains = IFO_SUPPORT_CHAINS
CurrentIfoPage.Layout = IfoLayout

export default CurrentIfoPage
