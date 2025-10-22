import { useTranslation } from '@pancakeswap/localization'
import { ArrowBackIcon, ArrowForwardIcon, Box, BoxProps, Flex, ScanLink, Table, Tag, Text } from '@pancakeswap/uikit'
import truncateHash from '@pancakeswap/utils/truncateHash'
import { formatDistanceToNow } from 'date-fns'
import { useCallback, useMemo, useState } from 'react'
import { styled } from 'styled-components'
import { getBlockExploreLink } from 'utils'
import { formatAmount } from 'utils/formatInfoNumbers'
import { useBurnStats } from 'views/BurnDashboard/hooks/useBurnStats'
import { getBurnInfoPrecision } from 'views/BurnDashboard/utils'

// Wrapper for horizontal scrolling
const TableWrapper = styled(Box)`
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch; // Smooth scrolling on iOS
  scrollbar-width: thin; // For Firefox

  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: ${({ theme }) => theme.radii.card};

  // Custom scrollbar styling for webkit browsers
  &::-webkit-scrollbar {
    height: 8px;
  }

  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.backgroundAlt};
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.primary};
    border-radius: 4px;

    &:hover {
      background: ${({ theme }) => theme.colors.primaryBright};
    }
  }
`

const StyledTable = styled(Table)`
  width: 100%;
  min-width: 800px; // Ensure table has minimum width for all columns
  background-color: ${({ theme }) => theme.card.background};
  padding: 8px;
  border-radius: ${({ theme }) => theme.radii.card};

  td,
  th {
    text-align: left;
    padding: 16px;
    white-space: nowrap; // Prevent text wrapping in cells
  }

  th {
    color: ${({ theme }) => theme.colors.secondary};
    font-size: 12px;
    text-transform: uppercase;
    font-weight: 600;
  }

  tr {
    border-bottom: 1px solid ${({ theme }) => theme.colors.cardBorder};
    &:last-child {
      border-bottom: none;
    }
  }
`

const StyledScanLink = styled(ScanLink).attrs({ icon: <></> })``

const Arrow = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.primary};
  padding: 0 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  &:hover:not(:disabled) {
    opacity: 0.8;
  }
`

const PageButtons = styled(Flex)`
  align-items: center;
  justify-content: center;
  margin-top: 16px;
  margin-bottom: 16px;
  padding: 0 16px;
`

const StyledTag = styled(Tag)`
  border-color: ${({ theme }) => theme.colors.cardBorder};
`

const ITEMS_PER_PAGE = 5

export const RealTimeBurnHistoryTable = (props: BoxProps) => {
  const { t } = useTranslation()
  const { data } = useBurnStats()

  // Pagination state
  const [page, setPage] = useState(1)

  // Get burn history data with fallback to empty array
  const burnHistory = useMemo(() => data?.burnHistoryTable || [], [data?.burnHistoryTable])

  // Calculate max pages with useMemo
  const maxPage = useMemo(() => {
    if (burnHistory.length === 0) return 1
    return Math.ceil(burnHistory.length / ITEMS_PER_PAGE)
  }, [burnHistory.length])

  // Get paginated data
  const paginatedData = useMemo(() => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE
    return burnHistory.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [burnHistory, page])

  // Format timestamp to relative time
  const formatTimeAgo = useCallback((timestamp: number) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true })
  }, [])

  // Handle page navigation
  const handlePrevPage = useCallback(() => {
    if (page > 1) {
      setPage(page - 1)
    }
  }, [page])

  const handleNextPage = useCallback(() => {
    if (page < maxPage) {
      setPage(page + 1)
    }
  }, [page, maxPage])

  return (
    <Box {...props}>
      <TableWrapper>
        <StyledTable>
          <thead>
            <tr>
              <th>{t('Tx Hash')}</th>
              <th>{t('Amount')}</th>
              <th>{t('Timestamp')}</th>
              <th>{t('From.sender')}</th>
              <th>{t('To.recipient')}</th>
              <th>{t('Type')}</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((item) => (
                <tr key={item.txHash}>
                  <td>
                    <StyledScanLink href={getBlockExploreLink(item.txHash, 'transaction')}>
                      <Text color="primary60" bold>
                        {truncateHash(item.txHash, 8, 8)}
                      </Text>
                    </StyledScanLink>
                  </td>
                  <td>
                    <Text>{formatAmount(item.amount, { precision: getBurnInfoPrecision(item.amount) })} CAKE</Text>
                  </td>
                  <td>
                    <Text>{formatTimeAgo(item.timestamp)}</Text>
                  </td>
                  <td>
                    <StyledScanLink href={getBlockExploreLink(item.from, 'address')}>
                      <Text color="primary60" bold>
                        {truncateHash(item.from, 6, 6)}
                      </Text>
                    </StyledScanLink>
                  </td>
                  <td>
                    <StyledScanLink href={getBlockExploreLink(item.to, 'address')}>
                      <Text color="primary60" bold>
                        {truncateHash(item.to, 6, 6)}
                      </Text>
                    </StyledScanLink>
                  </td>
                  <td>
                    <StyledTag variant="tertiary">{item.type}</StyledTag>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6}>
                  <Text textAlign="center">{t('No burn history available')}</Text>
                </td>
              </tr>
            )}
          </tbody>
        </StyledTable>
      </TableWrapper>

      {burnHistory.length > 0 && (
        <PageButtons>
          <Arrow onClick={handlePrevPage} disabled={page === 1} aria-label={t('Previous page')}>
            <ArrowBackIcon color={page === 1 ? 'textDisabled' : 'primary'} />
          </Arrow>

          <Text>{t('Page %page% of %maxPage%', { page, maxPage })}</Text>

          <Arrow onClick={handleNextPage} disabled={page === maxPage} aria-label={t('Next page')}>
            <ArrowForwardIcon color={page === maxPage ? 'textDisabled' : 'primary'} />
          </Arrow>
        </PageButtons>
      )}
    </Box>
  )
}
