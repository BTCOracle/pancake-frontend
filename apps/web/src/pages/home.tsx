import { Suspense } from 'react'
import { HomeV2 } from 'views/HomeV2'

const IndexPage = () => {
  return (
    <Suspense>
      <HomeV2 />
    </Suspense>
  )
}

IndexPage.chains = []

export default IndexPage
