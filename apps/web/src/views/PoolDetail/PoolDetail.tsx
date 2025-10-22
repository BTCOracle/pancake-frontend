import { AutoColumn } from '@pancakeswap/uikit'
import Page from 'components/Layout/Page'
import styled from 'styled-components'
import { BreadcrumbNav } from './components/BreadcrumbNav'
import { PoolInfo } from './components/PoolInfo'

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

export const PoolDetail: React.FC = () => {
  return (
    <StyledPage>
      <AutoColumn gap={['16px', null, null, '32px']}>
        <BreadcrumbNav />
        <PoolInfo />
      </AutoColumn>
    </StyledPage>
  )
}
