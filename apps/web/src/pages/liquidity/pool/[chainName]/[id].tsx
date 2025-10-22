import { SUPPORT_FARMS } from 'config/constants/supportChains'
import dynamic from 'next/dynamic'
import { NextPageWithLayout } from 'utils/page.types'
import { PoolDetail } from 'views/PoolDetail'

const PoolDetailPage = () => <PoolDetail />

const Page = dynamic(() => Promise.resolve(PoolDetailPage), {
  ssr: false,
}) as NextPageWithLayout

Page.chains = SUPPORT_FARMS

export default Page
