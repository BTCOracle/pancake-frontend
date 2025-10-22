import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { NextPageWithLayout } from 'utils/page.types'
import { InfoPageLayout } from 'views/V3Info/components/Layout'
import Pool from 'views/V3Info/views/PoolPage'

const PoolPage = () => {
  const router = useRouter()
  return <Pool address={String(router.query.address).toLowerCase()} />
}

const Page = dynamic(() => Promise.resolve(PoolPage), {
  ssr: false,
}) as NextPageWithLayout

Page.Layout = InfoPageLayout
Page.chains = [] // set all

export default Page
