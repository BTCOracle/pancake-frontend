import { Button, useMatchBreakpoints } from '@pancakeswap/uikit'
import Link from 'next/link'
import { useTranslation } from '@pancakeswap/localization'
import { Box, Flex, Text } from '@chakra-ui/react'
import { ApiV3PoolInfoConcentratedItem } from '@pancakeswap/solana-core-sdk'
import { useEffect, useMemo, memo } from 'react'
import { VList } from 'virtua'
import useFetchPoolById from '@/hooks/pool/useFetchPoolById'
import useFetchMultipleRpcClmmInfo from '@/hooks/pool/clmm/useFetchMultipleRpcClmmInfo'
import { ClmmDataWithUpdateFn } from '@/hooks/portfolio/useAllPositionInfo'
import { ClmmLockInfo } from '@/hooks/portfolio/clmm/useClmmBalance'
import { panelCard } from '@/theme/cssBlocks'
import { ClmmPositionItemsCard } from './components/Clmm/ClmmPositionItemsCard'
import { openCache } from './components/Clmm/ClmmPositionAccountItem'

const ClmmMyPositionTabContent = memo(
  ({
    isLoading,
    clmmBalanceInfo,
    lockInfo,
    refreshTag,
    setNoRewardClmmPos
  }: {
    isLoading: boolean
    refreshTag: number
    clmmBalanceInfo: ClmmDataWithUpdateFn
    lockInfo: ClmmLockInfo
    setNoRewardClmmPos: (val: string, isDelete?: boolean) => void
  }) => {
    const { t } = useTranslation()
    const { isMobile } = useMatchBreakpoints()
    const { formattedDataMap } = useFetchPoolById<ApiV3PoolInfoConcentratedItem>({
      idList: Array.from(clmmBalanceInfo.keys()),
      refreshTag,
      keepPreviousData: true
    })
    const allPositions = useMemo(() => {
      const data = Array.from(clmmBalanceInfo.entries())
      data.forEach((pos) => {
        const noneZeroPos = pos[1].filter((p) => !p.liquidity.isZero())
        const zeroPos = pos[1].filter((p) => p.liquidity.isZero())
        // eslint-disable-next-line no-param-reassign
        pos[1] = [...noneZeroPos.sort((a, b) => a.tickLower - b.tickLower), ...zeroPos.sort((a, b) => a.tickLower - b.tickLower)]
      })
      data.sort((a, b) => (formattedDataMap[b[0]]?.tvl || 0) - (formattedDataMap[a[0]]?.tvl || 0))
      return data
    }, [clmmBalanceInfo, formattedDataMap])

    const {
      dataMap,
      slot: poolSlot,
      mutate
    } = useFetchMultipleRpcClmmInfo({
      idList: Array.from(clmmBalanceInfo.keys()),
      refreshTag
    })

    const balance = Array.from(clmmBalanceInfo.values())[0]?.[0] || {}
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const positionSlot = Math.max(balance.slot ?? 0, balance.tickSlot ?? 0)

    useEffect(() => {
      if (poolSlot >= positionSlot || poolSlot === 0) return undefined

      const timerId = window.setTimeout(() => {
        mutate()
      }, 500)

      return () => {
        clearTimeout(timerId)
      }
    }, [poolSlot, positionSlot, mutate])

    useEffect(() => {
      return () => openCache.clear()
    }, [])

    return (
      <Box display="flex" flexDir="column" gap={4}>
        {allPositions.length ? (
          isMobile ? (
            <VList style={{ height: 'calc(100vh - 258px)' }} count={allPositions.length} itemSize={allPositions.length}>
              {allPositions.map((data) => (
                <ClmmPositionItemsCard
                  key={data[0]}
                  isLoading={isLoading}
                  poolId={data[0]}
                  positions={data[1]}
                  poolInfo={formattedDataMap[data[0]]}
                  lockInfo={lockInfo[data[0]]}
                  initRpcPoolData={
                    dataMap[data[0]]
                      ? {
                          poolId: data[0],
                          currentPrice: dataMap[data[0]].currentPrice.toNumber(),
                          poolInfo: dataMap[data[0]]
                        }
                      : undefined
                  }
                  setNoRewardClmmPos={setNoRewardClmmPos}
                />
              ))}
            </VList>
          ) : (
            allPositions.map((data) => (
              <ClmmPositionItemsCard
                key={data[0]}
                isLoading={isLoading}
                poolId={data[0]}
                positions={data[1]}
                poolInfo={formattedDataMap[data[0]]}
                lockInfo={lockInfo[data[0]]}
                initRpcPoolData={
                  dataMap[data[0]]
                    ? {
                        poolId: data[0],
                        currentPrice: dataMap[data[0]].currentPrice.toNumber(),
                        poolInfo: dataMap[data[0]]
                      }
                    : undefined
                }
                setNoRewardClmmPos={setNoRewardClmmPos}
              />
            ))
          )
        ) : (
          <Flex
            {...panelCard}
            alignItems="center"
            justifyContent="center"
            minH="200px"
            flexDir="column"
            py={2}
            px={2}
            gap={6}
            borderRadius="xl"
          >
            <Text variant="title" fontSize="sm">
              {t('You don’t have any concentrated liquidity positions.')}
            </Text>
            <Link href="/liquidity-pools">
              <Button>{t('Go to pools')}</Button>
            </Link>
          </Flex>
        )}
      </Box>
    )
  }
)

export { ClmmMyPositionTabContent }
