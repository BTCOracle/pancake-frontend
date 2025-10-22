import { useTranslation } from '@pancakeswap/localization'
import {
  AutoColumn,
  Box,
  Button,
  FlexGap,
  Grid,
  LogoRoundIcon,
  Skeleton,
  Text,
  useMatchBreakpoints,
} from '@pancakeswap/uikit'
import { NextLinkFromReactRouter } from '@pancakeswap/widgets-internal'
import { LightGreyCard } from 'components/Card'
import styled from 'styled-components'
import { BurnLastSevenDaysCard } from './components/burns/BurnLastSevenDaysCard'
import { RealTimeBurnHistoryTable } from './components/burns/RealTimeBurnHistoryTable'
import { TotalDeflationCard } from './components/burns/TotalDeflationCard'
import { WeeklyBurnStackedChart } from './components/burns/WeeklyBurnStackedChart'
import { YTDBurnCard } from './components/burns/YTDBurnCard'
import { YTDDeflationCard } from './components/burns/YTDDeflationCard'
import { EmissionsLastSevenDaysCard } from './components/emissions/EmissionsLastSevenDaysCard'
import { WeeklyEmissionsStackedBarChart } from './components/emissions/WeeklyEmissionsStackedBarChart'
import { YTDEmissionsCard } from './components/emissions/YTDEmissionsCard'
import { SupplyDeflationCombinedGraph } from './components/general/SupplyDeflationCombinedGraph'
import { SupplyPieChart } from './components/general/SupplyPieChart'
import { useBurnStats } from './hooks/useBurnStats'

const StyledGradientCard = styled(LightGreyCard)`
  background: ${({ theme }) => theme.colors.gradientCardHeader};
  padding: 12px 16px;
  width: fit-content;
`

const SkeletonCard = styled(Box)`
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border-radius: ${({ theme }) => theme.radii.card};
  height: 100%;
`

export const BurnDashboard = () => {
  const { t } = useTranslation()

  const { isMobile } = useMatchBreakpoints()
  const { data, isLoading, error } = useBurnStats()

  const lastUpdatedAt = new Date(data?.timestamp || 0).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <FlexGap mt="24px" gap="16px" justifyContent="space-between" alignItems="center" flexWrap="wrap">
        <FlexGap alignItems="center" gap="8px" flexWrap="wrap">
          <LogoRoundIcon width={isMobile ? '40px' : '60px'} height={isMobile ? '40px' : '60px'} />
          <Text fontSize={['32px', '32px', '56px']} color="secondary" bold>
            {t('Burn Dashboard')}
          </Text>
        </FlexGap>
        <FlexGap alignItems="center" gap="8px" flexWrap="wrap">
          {isLoading ? (
            <Skeleton width="240px" height="48px" borderRadius="default" />
          ) : data && data?.timestamp ? (
            <StyledGradientCard>
              <Text bold>{t('Last updated on: %lastUpdatedAt%', { lastUpdatedAt })}</Text>
            </StyledGradientCard>
          ) : null}
          <NextLinkFromReactRouter
            to="https://docs.pancakeswap.finance/governance-and-tokenomics/cake-tokenomics"
            target="_blank"
          >
            <Button variant="subtle" width="max-content">
              {t('Learn More')}
            </Button>
          </NextLinkFromReactRouter>
        </FlexGap>
      </FlexGap>
      {error && !data && (
        <LightGreyCard mt="16px" padding="16px">
          <Text>{t('An error occurred while fetching the data. Please try again later.')}</Text>
        </LightGreyCard>
      )}
      {isLoading ? (
        <Box>
          <Grid
            mt="24px"
            gridTemplateColumns={['1fr', '1fr', '1fr', '1fr', '1fr', '4fr 3fr 2fr']}
            style={{ gap: '24px' }}
          >
            <SkeletonCard>
              <Skeleton width="100%" height="100%" minHeight="400px" borderRadius="card" />
            </SkeletonCard>

            <AutoColumn gap="24px">
              <SkeletonCard>
                <Skeleton width="100%" height="200px" borderRadius="card" />
              </SkeletonCard>
              <SkeletonCard>
                <Skeleton width="100%" height="200px" borderRadius="card" />
              </SkeletonCard>
            </AutoColumn>
            <AutoColumn gap="24px">
              <SkeletonCard>
                <Skeleton width="100%" height="200px" borderRadius="card" />
              </SkeletonCard>
              <SkeletonCard>
                <Skeleton width="100%" height="200px" borderRadius="card" />
              </SkeletonCard>
            </AutoColumn>
          </Grid>

          <SkeletonCard mt="24px">
            <Skeleton width="100%" height="300px" borderRadius="card" />
          </SkeletonCard>

          <SkeletonCard mt="24px">
            <Skeleton width="100%" height="300px" borderRadius="card" />
          </SkeletonCard>

          <Text mt="40px" fontSize="24px" bold>
            {t('Real-Time Burn History')}
          </Text>
          <SkeletonCard mt="24px">
            <Skeleton width="100%" height="200px" borderRadius="card" />
          </SkeletonCard>

          <Text mt="40px" fontSize="24px" bold>
            {t('Emissions')}
          </Text>
          <Grid mt="24px" gridTemplateColumns={['1fr', '1fr', '1fr', '1fr 1fr']} style={{ gap: '24px' }}>
            <SkeletonCard>
              <Skeleton width="100%" height="150px" borderRadius="card" />
            </SkeletonCard>
            <SkeletonCard>
              <Skeleton width="100%" height="150px" borderRadius="card" />
            </SkeletonCard>
          </Grid>

          <SkeletonCard mt="24px">
            <Skeleton width="100%" height="300px" borderRadius="card" />
          </SkeletonCard>
        </Box>
      ) : (
        <Box>
          <Grid
            mt="24px"
            gridTemplateColumns={['1fr', '1fr', '1fr', '1fr', '1fr', '4fr 3fr 2fr']}
            style={{ gap: '24px' }}
          >
            <SupplyPieChart />

            <AutoColumn gap="24px">
              <BurnLastSevenDaysCard />
              <TotalDeflationCard />
            </AutoColumn>
            <AutoColumn gap="24px">
              <YTDBurnCard />
              <YTDDeflationCard />
            </AutoColumn>
          </Grid>

          <SupplyDeflationCombinedGraph mt="24px" />

          <WeeklyBurnStackedChart mt="24px" />

          <Text mt="40px" fontSize="24px" bold>
            {t('Real-Time Burn History')}
          </Text>
          <RealTimeBurnHistoryTable mt="24px" />

          <Text mt="40px" fontSize="24px" bold>
            {t('Emissions')}
          </Text>
          <Grid mt="24px" gridTemplateColumns={['1fr', '1fr', '1fr', '1fr 1fr']} style={{ gap: '24px' }}>
            <EmissionsLastSevenDaysCard />
            <YTDEmissionsCard />
          </Grid>

          <WeeklyEmissionsStackedBarChart mt="24px" />
        </Box>
      )}
    </div>
  )
}
