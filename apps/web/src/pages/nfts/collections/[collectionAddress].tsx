import { Flex, Spinner } from '@pancakeswap/uikit'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { Suspense } from 'react'
import CollectionPageRouter from 'views/Nft/market/Collection/CollectionPageRouter'

const CollectionPage = () => {
  const { collectionAddress } = useRouter().query
  if (!collectionAddress) return null

  return (
    <Suspense
      fallback={
        <Flex mt="80px" justifyContent="center">
          <Spinner />
        </Flex>
      }
    >
      <CollectionPageRouter />
    </Suspense>
  )
}

export default dynamic(() => Promise.resolve(CollectionPage), { ssr: false })
