import dynamic from 'next/dynamic'
import { NextPageWithLayout } from 'utils/page.types'
import { InfoPageLayout } from 'views/Info'
import Overview from 'views/Info/Overview'

const InfoPage = () => {
  return <Overview />
}

const Page = dynamic(() => Promise.resolve(InfoPage), {
  ssr: false,
}) as NextPageWithLayout

Page.Layout = InfoPageLayout
Page.chains = [] // set all

export default Page
