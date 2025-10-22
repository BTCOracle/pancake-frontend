import { INFINITY_SUPPORTED_CHAINS } from '@pancakeswap/infinity-sdk'
import { InfinityProvider } from 'hooks/infinity/useInfinityContext'
import dynamic from 'next/dynamic'
import { NextPageWithLayout } from 'utils/page.types'
import { InfoPageLayout } from 'views/InfinityInfo/components/Layout'
import Tokens from 'views/InfinityInfo/components/Tokens'

const InfoPage = () => {
  return (
    <InfinityProvider>
      <Tokens />
    </InfinityProvider>
  )
}

const Page = dynamic(() => Promise.resolve(InfoPage), {
  ssr: false,
}) as NextPageWithLayout

Page.Layout = InfoPageLayout
Page.chains = [...INFINITY_SUPPORTED_CHAINS]

export default Page
