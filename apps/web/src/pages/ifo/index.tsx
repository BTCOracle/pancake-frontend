import dynamic from 'next/dynamic'
import { NextPageWithLayout } from 'utils/page.types'
import { IfoPageLayout } from '../../views/Ifos'
import Ifo from '../../views/Ifos/Ifo'

const CurrentIfoPage = dynamic(() => Promise.resolve(Ifo), {
  ssr: false,
}) as NextPageWithLayout

CurrentIfoPage.Layout = IfoPageLayout as React.FC

export default CurrentIfoPage
