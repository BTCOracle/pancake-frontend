import { SUPPORT_FARMS } from 'config/constants/supportChains'
import dynamic from 'next/dynamic'
import { usePoolAprUpdater, useUpdateLatestTxReceipt } from 'state/farmsV4/hooks'

const UniversalFarms = dynamic(() => import('views/universalFarms/UniversalFarms').then((mod) => mod.UniversalFarms), {
  ssr: false,
})
const FarmsPage = () => {
  usePoolAprUpdater()
  useUpdateLatestTxReceipt()
  return <UniversalFarms />
}

FarmsPage.chains = SUPPORT_FARMS

export default FarmsPage
