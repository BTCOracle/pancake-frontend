import dynamic from 'next/dynamic'
import { NextPageWithLayout } from 'utils/page.types'
import Token from 'views/V3Info/views/TokensPage'
import { InfoPageLayout } from 'views/V3Info/components/Layout'

const TokenPage = () => {
  return <Token />
}

const Page = dynamic(() => Promise.resolve(TokenPage), {
  ssr: false,
}) as NextPageWithLayout

Page.Layout = InfoPageLayout
Page.chains = [] // set all

export default Page
