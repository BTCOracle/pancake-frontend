import { useEffect } from 'react'
import { Flex } from '@chakra-ui/react'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { pageRoutePathnames } from '@/utils/config/routers'

const Home: NextPage = () => {
  const router = useRouter()
  useEffect(() => {
    // no ssr
    router.replace(pageRoutePathnames.swap)
  }, [])
  return <Flex minHeight="100vh" direction="column" bgGradient="linear(178.57deg, #30467B -19.19%, #101C33 20.13%, #110E26 59.46% )" />
}

export default Home
