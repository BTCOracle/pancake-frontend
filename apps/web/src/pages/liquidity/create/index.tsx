import dynamic from 'next/dynamic'
import { NextPageWithLayout } from 'utils/page.types'
import { CHAIN_IDS } from 'utils/wagmi'
import { CreateLiquiditySelector } from 'views/CreateLiquidityPool'

const CreateLiquiditySelectorPage = () => {
  return (
    <>
      <CreateLiquiditySelector />
    </>
  )
}

const Page = dynamic(() => Promise.resolve(CreateLiquiditySelectorPage), {
  ssr: false,
}) as NextPageWithLayout
Page.chains = CHAIN_IDS
Page.screen = true

export default Page
