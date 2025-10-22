import { Box } from '@chakra-ui/react'
import { useMatchBreakpoints } from '@pancakeswap/uikit'
import { PositionTabValues } from '@/hooks/portfolio/useAllPositionInfo'
import { AcceleraytorAlertChip } from './AcceleraytorAlertChip'
import { CreateFarmTabValues } from './components/SectionMyFarms'
import SectionMyPositions from './components/SectionMyPositions'

export type PortfolioPageQuery = {
  section?: 'overview' | 'my-positions' | 'my-created-farm' | 'acceleraytor'
  position_tab?: PositionTabValues
  create_farm_tab?: CreateFarmTabValues
}

export default function Portfolio() {
  const { isMobile } = useMatchBreakpoints()
  return (
    <Box overflowX="hidden">
      <SectionMyPositions />
      {!isMobile && <Box pb="40px" />}
    </Box>
  )
}
