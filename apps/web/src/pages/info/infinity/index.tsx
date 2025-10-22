import { INFINITY_SUPPORTED_CHAINS } from '@pancakeswap/infinity-sdk'
import dynamic from 'next/dynamic'
import { NextPageWithLayout } from 'utils/page.types'
import { InfoPageLayout } from 'views/InfinityInfo/components/Layout'
import Overview from 'views/Info/Overview'

const InfoPage = () => {
  return <Overview />
}

const Page = dynamic(() => Promise.resolve(InfoPage), {
  ssr: false,
}) as NextPageWithLayout

Page.Layout = InfoPageLayout
Page.chains = [...INFINITY_SUPPORTED_CHAINS]

export default Page
