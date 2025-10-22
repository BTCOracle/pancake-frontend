import dynamic from 'next/dynamic'
import { NextPageWithLayout } from 'utils/page.types'
import { InfoPageLayout } from 'views/Info'
import Tokens from 'views/Info/Tokens'

const InfoTokensPage = () => {
  return <Tokens />
}

const Page = dynamic(() => Promise.resolve(InfoTokensPage), {
  ssr: false,
}) as NextPageWithLayout

Page.Layout = InfoPageLayout
Page.chains = []

export default Page
