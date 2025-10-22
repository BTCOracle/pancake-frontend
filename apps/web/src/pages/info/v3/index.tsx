import dynamic from 'next/dynamic'
import { NextPageWithLayout } from 'utils/page.types'
import { InfoPageLayout } from 'views/V3Info/components/Layout'
import Overview from 'views/V3Info'

const InfoPage = () => {
  return <Overview />
}

const Page = dynamic(() => Promise.resolve(InfoPage), {
  ssr: false,
}) as NextPageWithLayout

Page.Layout = InfoPageLayout
Page.chains = [] // set all

export default Page
