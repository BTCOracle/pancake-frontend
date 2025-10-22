import dynamic from 'next/dynamic'
import { NextPageWithLayout } from 'utils/page.types'
import { InfoPageLayout } from 'views/Info'
import Pools from 'views/Info/Pools'

const InfoPoolsPage = () => {
  return <Pools />
}

const Page = dynamic(() => Promise.resolve(InfoPoolsPage), {
  ssr: false,
}) as NextPageWithLayout

Page.Layout = InfoPageLayout
Page.chains = []

export default Page
