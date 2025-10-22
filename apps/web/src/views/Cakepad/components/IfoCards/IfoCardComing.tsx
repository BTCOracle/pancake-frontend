import { FlexGap } from '@pancakeswap/uikit'
import { styled } from 'styled-components'
import { IfoSaleInfoCard } from './IfoSaleInfoCard'
import { IfoSaleDetailCard } from './IfoSaleDetailCard'

const SaleInfoWrapper = styled(FlexGap)`
  flex-direction: column;
  ${({ theme }) => theme.mediaQueries.md} {
    flex-direction: row;
  }
`

export const IfoCardComing: React.FC = () => (
  <SaleInfoWrapper gap="16px">
    <IfoSaleInfoCard />
    <IfoSaleDetailCard />
  </SaleInfoWrapper>
)
