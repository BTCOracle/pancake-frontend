import { Box, Skeleton } from '@chakra-ui/react'

import { useTranslation } from '@pancakeswap/localization'
import PageHeroTitle from '@/components/PageHeroTitle'
import useFetchStakePools from '@/hooks/pool/useFetchStakePools'
import useFarmPositions from '@/hooks/portfolio/farm/useFarmPositions'
import StakingPoolItem from './components/StakingPoolItem'

export default function Staking() {
  const { t } = useTranslation()
  const { activeStakePools, isLoading } = useFetchStakePools({})
  const { lpBasedData } = useFarmPositions({})

  return (
    <Box>
      <Box mb={[4, 8]}>
        <PageHeroTitle title={t('Staking')} description={t('Stake RAY to earn additional RAY yield.') || ''} />
      </Box>
      {isLoading ? (
        <Skeleton width="80%" height="20px" />
      ) : (
        activeStakePools.map((pool) => (
          <StakingPoolItem key={pool.id} pool={pool} apiVaultData={lpBasedData.get(pool?.lpMint.address || '')} />
        ))
      )}
    </Box>
  )
}
