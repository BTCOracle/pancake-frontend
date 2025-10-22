import { SUPPORT_FARMS } from 'config/constants/supportChains'
import dynamic from 'next/dynamic'
import { NextPageWithLayout } from 'utils/page.types'
import { NonEVMChainId } from '@pancakeswap/chains'
import UniversalFarmsPage from './pools'

const Page = dynamic(() => Promise.resolve(UniversalFarmsPage), {
  ssr: false,
}) as NextPageWithLayout

Page.chains = [...SUPPORT_FARMS, NonEVMChainId.SOLANA]
export default Page
