import { useTranslation } from '@pancakeswap/localization'
import { Heading } from '@pancakeswap/uikit'
import Page from 'components/Layout/Page'
import { useMemo } from 'react'
import PoolTable from 'views/Info/components/InfoTables/PoolsTable'
import { useNonSpamPoolsData } from 'views/Info/hooks/usePoolsData'

const Pools: React.FC<React.PropsWithChildren> = () => {
  const { t } = useTranslation()
  const { poolsData } = useNonSpamPoolsData()
  const somePoolsAreLoading = useMemo(() => {
    return poolsData.some((pool) => !pool?.token0Price)
  }, [poolsData])

  return (
    <Page>
      <Heading scale="lg" mt="40px" mb="16px" id="info-pools-title">
        {t('All Pairs')}
      </Heading>
      <PoolTable poolDatas={poolsData} loading={somePoolsAreLoading} />
    </Page>
  )
}

export default Pools
