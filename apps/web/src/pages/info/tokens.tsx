import dynamic from 'next/dynamic'
import { NextPageWithLayout } from 'utils/page.types'
import Tokens from 'views/Info/Tokens'
import { InfoPageLayout } from 'views/Info'

const InfoTokensPage = () => {
  return <Tokens />
}

const Page = dynamic(() => Promise.resolve(InfoTokensPage), {
  ssr: false,
}) as NextPageWithLayout

Page.Layout = InfoPageLayout
Page.chains = [] // set all

export default Page
