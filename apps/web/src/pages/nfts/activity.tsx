import dynamic from 'next/dynamic'
import Activity from 'views/Nft/market/Activity'

const ActivityPage = () => {
  return <Activity />
}

export default dynamic(() => Promise.resolve(ActivityPage), { ssr: false })
