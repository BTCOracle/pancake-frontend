import { Card, CardBody } from '@pancakeswap/uikit'
import styled from 'styled-components'

import { useInfinityPoolIdRouteParams } from 'hooks/dynamicRoute/usePoolIdRoute'
import { usePoolType } from '../hooks/usePoolType'
import { BinPriceRangePanel } from './BinPriceRangePanel'
import { CLPriceRangePanel } from './CLPriceRangePanel'
import { InfinityDepositPanel } from './InfinityDepositPanel'
import { ResponsiveColumns } from './styles'

const StyledCard = styled(Card)`
  width: 100%;
`

export const AddLiquidityInfinityForm = () => {
  const { chainId, poolId } = useInfinityPoolIdRouteParams()
  const poolType = usePoolType({ poolId, chainId })

  return (
    <ResponsiveColumns>
      <StyledCard style={{ overflow: 'visible', width: '100%' }}>
        <CardBody>
          {poolType === 'CL' && <CLPriceRangePanel />}
          {poolType === 'Bin' && <BinPriceRangePanel />}
        </CardBody>
      </StyledCard>

      <InfinityDepositPanel poolId={poolId} chainId={chainId} />
    </ResponsiveColumns>
  )
}
