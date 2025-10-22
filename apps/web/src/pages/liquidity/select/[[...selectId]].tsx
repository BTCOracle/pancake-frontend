import { useTranslation } from '@pancakeswap/localization'
import { Breadcrumbs, Container } from '@pancakeswap/uikit'
import PageLoader from 'components/Loader/PageLoader'
import { SelectIdRoute } from 'dynamicRoute'
import { useDefaultSelectIdRoute, useSelectIdRoute } from 'hooks/dynamicRoute/useSelectIdRoute'
import dynamic from 'next/dynamic'
import { NextPageWithLayout } from 'utils/page.types'
import NextLink from 'next/link'
import { CHAIN_IDS } from 'utils/wagmi'
import { AddLiquiditySelector } from 'views/AddLiquiditySelector'

export type RouteType = typeof SelectIdRoute

const LiquiditySelectPage = () => {
  const { routeParams } = useSelectIdRoute()
  const { t } = useTranslation()
  useDefaultSelectIdRoute()

  if (!routeParams) {
    return <PageLoader />
  }

  return (
    <Container mx="auto" my="24px" maxWidth="1200px" minHeight="calc(100vh - 200px)">
      <Breadcrumbs>
        <NextLink color="primary60" href="/liquidity/pools">
          {t('Farms')}
        </NextLink>
        <NextLink color="primary60" href="#">
          {t('Add Liquidity')}
        </NextLink>
      </Breadcrumbs>
      <AddLiquiditySelector />
    </Container>
  )
}

const Page = dynamic(() => Promise.resolve(LiquiditySelectPage), {
  ssr: false,
}) as NextPageWithLayout
Page.screen = true
Page.chains = CHAIN_IDS

export default Page
