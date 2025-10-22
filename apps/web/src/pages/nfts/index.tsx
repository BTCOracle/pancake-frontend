import dynamic from 'next/dynamic'
import NftMarket from 'views/Nft/market/Home'

const NftMarketPage = () => {
  return <NftMarket />
}

export default dynamic(() => Promise.resolve(NftMarketPage), { ssr: false })
