import { AutoColumn, Grid, useMatchBreakpoints } from '@pancakeswap/uikit'
import Page from 'components/Layout/Page'
import styled from 'styled-components'
import { useSolanaV3PositionIdRouteParams } from 'hooks/dynamicRoute/usePositionIdRoute'
import { BreadcrumbNav } from './components/BreadcrumbNav'
import { PoolInfoCard } from './components/PoolInfoCard'
import { PositionChart } from './components/PositionChart'
import { useSolanaV3Position } from './hooks/useSolanaV3Position'
import { PositionCard } from './components/PositionCard'
import { usePoolInfoByQuery } from './hooks/usePoolInfoByQuery'

const StyledPage = styled(Page)`
  @media screen and (min-width: 370px) {
    padding-left: 12px;
    padding-right: 12px;
  }
  ${({ theme }) => theme.mediaQueries.sm} {
    padding-left: 24px;
    padding-right: 24px;
  }
`
export const SolanaV3Position = () => {
  const { poolId, mintId } = useSolanaV3PositionIdRouteParams()
  const position = useSolanaV3Position(mintId)
  const poolInfo = usePoolInfoByQuery()

  const { isMobile, isMd } = useMatchBreakpoints()
  const isSmallScreen = isMobile || isMd
  return (
    <StyledPage>
      <AutoColumn gap={['16px', null, null, '32px']}>
        <BreadcrumbNav />
        <PoolInfoCard />
        <AutoColumn gap="lg">
          {/* <PoolTvlWarning poolInfo={poolInfo} /> */}
          <Grid gridGap="24px" gridTemplateColumns={['1fr', '1fr', '1fr', '2fr 1fr']}>
            {position && poolInfo && poolId && (
              <PositionChart poolId={poolId} position={position} poolInfo={poolInfo.rawPool} />
            )}
            {position && poolInfo && poolId && (
              <PositionCard
                position={position}
                poolInfo={poolInfo}
                style={{
                  order: isSmallScreen ? -1 : 0,
                }}
              />
            )}
          </Grid>
        </AutoColumn>
      </AutoColumn>
    </StyledPage>
  )
}
