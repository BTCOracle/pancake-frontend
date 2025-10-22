import dynamic from 'next/dynamic'
import Collections from 'views/Nft/market/Collections'

const CollectionsPage = () => {
  return <Collections />
}

export default dynamic(() => Promise.resolve(CollectionsPage), { ssr: false })
