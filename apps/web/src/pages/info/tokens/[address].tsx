import { Flex, Spinner } from '@pancakeswap/uikit'
import dynamic from 'next/dynamic'
import { NextPageWithLayout } from 'utils/page.types'
import { Suspense } from 'react'
import { invalidAddressCheck, useTokenParams } from 'utils/pageUtils'
import { InfoPageLayout } from 'views/Info'
import Token from 'views/Info/Tokens/TokenPage'

const TokenPage = () => {
  const { address } = useTokenParams()
  if (!address || invalidAddressCheck(String(address))) {
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
      <Token routeAddress={address} />
    </Suspense>
  )
}

const Page = dynamic(() => Promise.resolve(TokenPage), {
  ssr: false,
}) as NextPageWithLayout

Page.Layout = InfoPageLayout
Page.chains = [] // set all

export default Page
