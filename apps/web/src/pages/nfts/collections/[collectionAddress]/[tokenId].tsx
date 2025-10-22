import { Flex, Spinner } from '@pancakeswap/uikit'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { Suspense } from 'react'
import IndividualNFT from 'views/Nft/market/Collection/IndividualNFTPage'

const IndividualNFTPage = () => {
  const { collectionAddress, tokenId } = useRouter().query
  if (!collectionAddress || !tokenId) return null
  return (
    <Suspense
      fallback={
        <Flex mt="80px" justifyContent="center">
          <Spinner />
        </Flex>
      }
    >
      <IndividualNFT />
    </Suspense>
  )
}

export default dynamic(() => Promise.resolve(IndividualNFTPage), { ssr: false })
