import { useTranslation } from '@pancakeswap/localization'

import { Breadcrumbs, Container } from '@pancakeswap/uikit'
import PageLoader from 'components/Loader/PageLoader'
import { SelectIdRoute } from 'dynamicRoute'
import { useDefaultSelectIdRoute, useSelectIdRoute } from 'hooks/dynamicRoute/useSelectIdRoute'
import dynamic from 'next/dynamic'
import { NextPageWithLayout } from 'utils/page.types'
import NextLink from 'next/link'
import { CHAIN_IDS } from 'utils/wagmi'
import { PoolList } from 'views/AddLiquidityInfinity/components/PoolList'

export type RouteType = typeof SelectIdRoute

const PoolListPage = () => {
  const { routeParams } = useSelectIdRoute()
  const { t } = useTranslation()
  useDefaultSelectIdRoute()

  if (!routeParams) {
    return <PageLoader />
  }

  return (
    <Container mx="auto" my="24px" maxWidth="1200px">
      <Breadcrumbs>
        <NextLink href="/liquidity/pools">{t('Farms')}</NextLink>
        <NextLink href="#">{t('Add Liquidity')}</NextLink>
      </Breadcrumbs>
      <PoolList />
    </Container>
  )
}

const Page = dynamic(() => Promise.resolve(PoolListPage), {
  ssr: false,
}) as NextPageWithLayout
Page.screen = true
Page.chains = CHAIN_IDS

export default Page
