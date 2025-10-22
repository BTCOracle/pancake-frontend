import { InfinityProvider } from 'hooks/infinity/useInfinityContext'
import dynamic from 'next/dynamic'
import { NextPageWithLayout } from 'utils/page.types'
import { useTokenParams } from 'utils/pageUtils'
import { InfoPageLayout } from 'views/InfinityInfo/components/Layout'
import TokenInfo from 'views/InfinityInfo/components/Tokens/TokenInfo'

const TokenPage = () => {
  const { address } = useTokenParams()
  if (!address) {
    return null
  }

  return (
    <InfinityProvider>
      <TokenInfo address={address.toLowerCase()} />
    </InfinityProvider>
  )
}

const Page = dynamic(() => Promise.resolve(TokenPage), {
  ssr: false,
}) as NextPageWithLayout

Page.Layout = InfoPageLayout
Page.chains = [] // set all

export default Page
