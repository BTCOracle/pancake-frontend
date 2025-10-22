import { memo } from 'react'
import { styled } from 'styled-components'

const Container = styled.div<{ $isChartPaneOpen: boolean }>`
  background: ${({ theme }) => theme.colors.gradientVioletAlt};

  ${({ $isChartPaneOpen }) =>
    $isChartPaneOpen &&
    `  
    @media only screen and (max-width: 575px) and (min-height: 740px) {
      height: calc(100vh);
    }
`}
  ${({ theme }) => theme.mediaQueries.lg} {
    height: calc(100vh - 115px);
  }
  overflow: hidden;
`

export default memo(Container)
