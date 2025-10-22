import { Box } from '@pancakeswap/uikit'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useMemo } from 'react'
import { PoolInfo } from 'state/farmsV4/state/type'
import styled from 'styled-components'
import { searchQueryAtom, updateFilterAtom } from 'views/universalFarms/atom/searchQueryAtom'
import { PoolsFilterPanel } from 'views/universalFarms/components/PoolsFilterPanel'
import { getIndexByProtocols } from 'views/universalFarms/utils/queryParser'
import { isEvm, NonEVMChainId } from '@pancakeswap/chains'
import { PoolsTable } from './components/PoolsTable'

const Container = styled(Box)`
  width: 100%;
  margin: 0 auto;
`

interface MiniUniversalFarmsProps {
  onPoolClick?: (pool: PoolInfo) => void
}

export const MiniUniversalFarms: React.FC<MiniUniversalFarmsProps> = ({ onPoolClick }) => {
  const { chainId } = useActiveChainId()

  const query = useAtomValue(searchQueryAtom)
  const updateFilter = useSetAtom(updateFilterAtom)

  const poolsFilter = useMemo(
    () => ({
      selectedProtocolIndex: getIndexByProtocols(query.protocols),
      search: query.keywords,
    }),
    [query, chainId],
  )

  // Only show data from active chain
  useEffect(() => {
    updateFilter({ selectedNetwork: [chainId] })
  }, [chainId, updateFilter])

  return (
    <Container>
      <Box mb="24px">
        <PoolsFilterPanel includeSolana value={poolsFilter} onChange={updateFilter} showNetworkFilter={false} />
      </Box>
      <PoolsTable onPoolClick={onPoolClick} />
    </Container>
  )
}
