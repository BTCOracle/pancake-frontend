import { Flex, Spinner } from '@pancakeswap/uikit'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { NextPageWithLayout } from 'utils/page.types'
import { Suspense } from 'react'
import { invalidAddressCheck } from 'utils/pageUtils'
import { InfoPageLayout } from 'views/Info'
import Token from 'views/Info/Tokens/TokenPage'

const TokenPage = () => {
  const router = useRouter()
  const { address } = router.query

  if (invalidAddressCheck(String(address))) {
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
      <Token routeAddress={String(address).toLowerCase()} />
    </Suspense>
  )
}

const Page = dynamic(() => Promise.resolve(TokenPage), {
  ssr: false,
}) as NextPageWithLayout

Page.Layout = InfoPageLayout
Page.chains = []

export default Page
