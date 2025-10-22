import { useTranslation } from '@pancakeswap/localization'
import { Box, Card, CardProps, FlexGap } from '@pancakeswap/uikit'
import { useMemo, useState } from 'react'
import { PoolInfo } from 'state/farmsV4/state/type'
import styled from 'styled-components'
import { isInfinityProtocol } from 'utils/protocols'

import { Protocol } from '@pancakeswap/farms'
import { isSolana } from '@pancakeswap/chains'
import { TabMenu } from 'views/BurnDashboard/components/TabMenu'
import { useRouterQuery } from '../hooks/useRouterQuery'
import { TimeFilter } from '../types'
import { ChartFee } from './ChartFee'
import { ChartLiquidity } from './ChartLiquidity'
import { ChartTVL } from './ChartTVL'
import { ChartVolume } from './ChartVolume'
import { SolanaChartLiquidity } from './ChartLiquidity/SolanaChartLiquidity'

enum PoolChart {
  Volume = 0,
  Liquidity,
  Fees,
  TVL,
  Donation,
  DynamicFee,
}

const TabsContainer = styled.div`
  margin-bottom: 24px;
  padding: 24px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.input};
`

const TabButton = styled.button<{ $active?: boolean; $enabled?: boolean }>`
  background: none;
  border: none;
  padding: 0;
  font-size: 16px;
  font-weight: ${({ $active }) => ($active ? 600 : 400)};
  cursor: ${({ $enabled = true }) => ($enabled ? 'pointer' : 'not-allowed')};
  color: ${({ theme, $active, $enabled = true }) => {
    if (!$enabled) return theme.colors.textDisabled
    return $active ? theme.colors.secondary : theme.colors.textSubtle
  }};
  transition: color 0.2s ease;
  display: ${({ $enabled = true }) => ($enabled ? 'block' : 'none')};

  &:hover {
    color: ${({ theme, $enabled = true }) => {
      if (!$enabled) return theme.colors.textDisabled
      return theme.colors.secondary
    }};
  }
`

type PoolChartsProps = {
  poolInfo?: PoolInfo | null
} & CardProps
export const PoolCharts: React.FC<PoolChartsProps> = ({ poolInfo, ...props }) => {
  const { t } = useTranslation()
  const { id } = useRouterQuery()
  const isInfinity = useMemo(() => isInfinityProtocol(poolInfo?.protocol), [poolInfo])
  const isV3 = useMemo(() => poolInfo?.protocol === 'v3', [poolInfo])
  const isV2OrStable = useMemo(
    () => poolInfo?.protocol === Protocol.V2 || poolInfo?.protocol === Protocol.STABLE,
    [poolInfo],
  )
  const [chart, setChart] = useState<PoolChart>(PoolChart.Volume)

  const [timeFilter, setTimeFilter] = useState<TimeFilter>(TimeFilter.D)

  return (
    <Card {...props}>
      <TabsContainer>
        <FlexGap
          justifyContent="space-between"
          alignItems="center"
          flexDirection={['column', null, null, 'row']}
          gap="16px"
        >
          <FlexGap gap="32px" alignItems="center">
            <TabButton $active={chart === PoolChart.Volume} onClick={() => setChart(PoolChart.Volume)}>
              {t('Volume')}
            </TabButton>
            <TabButton
              $active={chart === PoolChart.Liquidity}
              $enabled={!isV2OrStable}
              onClick={() => setChart(PoolChart.Liquidity)}
            >
              {t('Liquidity')}
            </TabButton>
            <TabButton
              $active={chart === PoolChart.Fees}
              $enabled={isV3 || isInfinity}
              onClick={() => setChart(PoolChart.Fees)}
            >
              {t('Fees')}
            </TabButton>
            <TabButton $active={chart === PoolChart.TVL} onClick={() => setChart(PoolChart.TVL)}>
              {t('TVL')}
            </TabButton>
          </FlexGap>
          {(chart === PoolChart.Volume || chart === PoolChart.TVL) && (
            <TabMenu
              tabs={['D', 'W', 'M', 'Y'] as TimeFilter[]}
              defaultTab={TimeFilter.D}
              onTabChange={(tab) => setTimeFilter(tab as TimeFilter)}
            />
          )}
        </FlexGap>
      </TabsContainer>
      <Box padding="0 24px 24px 24px">
        {chart === PoolChart.Volume ? <ChartVolume address={id} poolInfo={poolInfo} timeFilter={timeFilter} /> : null}
        {chart === PoolChart.Liquidity ? (
          isV2OrStable ? (
            <ChartTVL address={id} poolInfo={poolInfo} timeFilter={timeFilter} />
          ) : isSolana(poolInfo?.chainId) ? (
            <SolanaChartLiquidity address={id} />
          ) : (
            <ChartLiquidity address={id} poolInfo={poolInfo} />
          )
        ) : null}
        {chart === PoolChart.Fees ? <ChartFee address={id} poolInfo={poolInfo} /> : null}
        {chart === PoolChart.TVL ? <ChartTVL address={id} poolInfo={poolInfo} timeFilter={timeFilter} /> : null}
      </Box>
    </Card>
  )
}
