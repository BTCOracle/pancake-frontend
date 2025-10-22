import { Flex, Spinner } from '@pancakeswap/uikit'
import dynamic from 'next/dynamic'
import { NextPageWithLayout } from 'utils/page.types'
import { Suspense } from 'react'
import { useTokenParams } from 'utils/pageUtils'
import { InfoPageLayout } from 'views/V3Info/components/Layout'
import Token from 'views/V3Info/views/TokenPage'

const TokenPage = () => {
  const { address } = useTokenParams()
  if (!address) {
    return null
  }

  return (
    <Suspense
      fallback={
        <Flex mt="80px" justifyContent="center">
          <Spinner />
        </Flex>
      }
    >
      <Token address={String(address).toLowerCase()} />
    </Suspense>
  )
}

const Page = dynamic(() => Promise.resolve(TokenPage), {
  ssr: false,
}) as NextPageWithLayout

Page.Layout = InfoPageLayout
Page.chains = [] // set all

export default Page
