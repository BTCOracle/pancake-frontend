import { Protocol } from '@pancakeswap/farms'
import { Box } from '@pancakeswap/uikit'
import PageLoader from 'components/Loader/PageLoader'
import { PositionIdRoute } from 'dynamicRoute'
import { usePositionIdRoute } from 'hooks/dynamicRoute/usePositionIdRoute'
import dynamic from 'next/dynamic'
import { NextPageWithLayout } from 'utils/page.types'
import NotFoundPage from 'pages/404'
import { CHAIN_IDS } from 'utils/wagmi'
import { IncreaseLiquidity } from 'views/IncreaseLiquidity'
import { InfinityBinPosition } from 'views/PositionInfinity/InfinityBinPosition'
import { InfinityCLPosition } from 'views/PositionInfinity/InfinityCLPosition'
import { RemoveBinPosition, RemoveClPosition } from 'views/RemoveLiquidityInfinity'
import { SolanaV3Position } from 'views/PositionSolana/SolanaV3Position'

export type RouteType = typeof PositionIdRoute

const LiquidityPage = () => {
  const { routeParams, routeError, protocol, action } = usePositionIdRoute()

  if (routeError) {
    console.error(routeError)
    return <NotFoundPage />
  }

  if (!routeParams) {
    return <PageLoader />
  }

  if (action === 'increase') {
    return (
      <Box my="24px">
        {/* only support clamm */}
        <IncreaseLiquidity />
      </Box>
    )
  }

  if (action === 'decrease') {
    return (
      <Box my="24px">
        {protocol === Protocol.InfinityCLAMM && <RemoveClPosition />}
        {protocol === Protocol.InfinityBIN && <RemoveBinPosition />}
      </Box>
    )
  }

  if (protocol === Protocol.InfinityCLAMM) {
    return <InfinityCLPosition />
  }

  if (protocol === Protocol.InfinityBIN) {
    return <InfinityBinPosition />
  }

  if (protocol === Protocol.V3 && routeParams.positionId[1] === 'solana') {
    return <SolanaV3Position />
  }

  return null
}

const Page = dynamic(() => Promise.resolve(LiquidityPage), {
  ssr: false,
}) as NextPageWithLayout

Page.chains = CHAIN_IDS

export default Page
