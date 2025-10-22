import { Box, Flex, Grid, GridItem, Highlight, HStack, Tag, Text, useDisclosure, VStack } from '@chakra-ui/react'
import router from 'next/router'
import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from '@pancakeswap/localization'
import { wSolToSol } from '@/utils/token'
import Button from '@/components/Button'
import { Desktop, Mobile } from '@/components/MobileDesktop'
import PanelCard from '@/components/PanelCard'
import TokenAvatar from '@/components/TokenAvatar'
import TokenAvatarPair from '@/components/TokenAvatarPair'
import Tooltip from '@/components/Tooltip'
import { AprKey, FormattedPoolInfoItem } from '@/hooks/pool/type'
import SwapPoolItemIcon from '@/icons/misc/SwapPoolItemIcon'
import OpenBookIcon from '@/icons/misc/OpenBookIcon'
import PulseIcon from '@/icons/misc/PulseIcon'
import QuestionCircleIcon from '@/icons/misc/QuestionCircleIcon'
import StarIcon from '@/icons/misc/StarIcon'
import { colors } from '@/theme/cssVariables'
import { formatCurrency, formatToRawLocaleStr } from '@/utils/numberish/formatter'
import toPercentString from '@/utils/numberish/toPercentString'
import useResponsive from '@/hooks/useResponsive'
import { pageRoutePathnames } from '@/utils/config/routers'

import { type TimeBase } from '../Pools'
import { getFavoritePoolCache, setFavoritePoolCache, toAPRPercent } from '../util'
import PoolDetailMobileDrawer from './PoolDetailMobileDrawer'
import { aprColors, PoolListItemAprLine } from './PoolListItemAprLine'
import { PoolListItemAprPie } from './PoolListItemAprPie'
import { PoolListItemRewardStack } from './PoolListItemRewardStack'

export default function PoolListItem({
  timeBase,
  pool,
  field,
  onOpenChart
}: {
  timeBase: TimeBase
  pool: FormattedPoolInfoItem
  field: AprKey
  onOpenChart?(pool: FormattedPoolInfoItem): void
}) {
  const { t } = useTranslation()
  const { isMobile } = useResponsive()
  const [isFavorite, setIsFavoriteState] = useState(getFavoritePoolCache().has(pool.id))

  const handleOpenChart = useCallback(() => {
    onOpenChart?.(pool)
  }, [onOpenChart, pool])

  const [baseToken, quoteToken] = useMemo(
    () => [
      { ...pool.mintA, priority: 3 },
      { ...pool.mintB, priority: 3 }
    ],
    [pool.mintA, pool.mintB]
  )

  const { isOpen: isPoolDetailOpen, onOpen: onPoolDetailOpen, onClose: onPoolDetailClose } = useDisclosure()

  const timeData = useMemo(() => pool[field], [pool, field])

  const onFavoriteClick = () => {
    setIsFavoriteState((v) => !v)
    setFavoritePoolCache(pool.id)
  }

  const onPoolClick = useCallback(() => {
    isMobile && onPoolDetailOpen()
  }, [isMobile, onPoolDetailOpen])

  const onClickDeposit = useCallback(() => {
    const isStandard = pool.type === 'Standard'
    router.push({
      pathname: isStandard ? '/liquidity/increase' : '/clmm/create-position',
      query: {
        ...(isStandard ? { mode: 'add' } : {}),
        pool_id: pool.id
      }
    })
  }, [pool])

  const onClickSwap = useCallback(() => {
    const getMint = (address: string) => {
      return pageRoutePathnames.swap.includes('jupiter') ? address : wSolToSol(address)
    }
    const [inputMint, outputMint] = [getMint(pool.mintA.address), getMint(pool.mintB.address)]
    router.push({
      pathname: pageRoutePathnames.swap,
      query: {
        inputMint,
        outputMint
      }
    })
  }, [pool])

  const feeApr = pool?.allApr[field].find((s) => s.isTradingFee)
  const rewardApr = useMemo(() => pool?.allApr[field].filter((s) => !s.isTradingFee && !!s.token) || [], [field, pool?.allApr])
  const aprData = useMemo(
    () => ({
      fee: {
        apr: feeApr?.apr || 0,
        percentInTotal: feeApr?.percent || 0
      },
      rewards:
        rewardApr.map((r) => ({
          apr: r.apr,
          percentInTotal: r.percent,
          mint: r.token!
        })) || [],
      apr: rewardApr.reduce((acc, cur) => acc + cur.apr, 0) + (feeApr?.apr || 0)
    }),
    [feeApr?.apr, feeApr?.percent, rewardApr]
  )

  return (
    <>
      <Box display="block" onClick={onPoolClick}>
        <Desktop>
          <PanelCard borderRadius="16px" pt="16px" pb="20px" px="20px" position="relative" overflow="hidden">
            <StarIcon
              selected={isFavorite}
              onClick={onFavoriteClick}
              style={{ position: 'absolute', top: '25px', right: '20px', cursor: 'pointer' }}
            />
            <VStack w="full" spacing={4}>
              {/* Header part */}
              <VStack w="full" spacing={2}>
                <VStack spacing={0}>
                  <TokenAvatarPair token1={baseToken} token2={quoteToken} size="lg" flexShrink={0} />
                  <Text fontSize="24px" fontWeight="500" color={colors.textPrimary}>
                    {pool.poolName}
                  </Text>
                </VStack>
                {/* APR part */}
                <Flex align="center" borderRadius="lg" w="full" justify="center" minH="36px">
                  <Tooltip
                    isContentCard
                    variant="card"
                    label={
                      <Flex minW="260px" direction="column" py={2} px={3} gap={4}>
                        <Flex justify="space-between">
                          <Text fontSize="sm" color={colors.textSecondary}>
                            {t('Total APR')}
                          </Text>
                          <Text fontSize="sm" color={colors.textPrimary}>
                            {formatToRawLocaleStr(toAPRPercent(pool.totalApr[field]))}
                          </Text>
                        </Flex>
                        <Grid templateColumns="60px 1fr" gap={8}>
                          <GridItem>
                            <PoolListItemAprPie aprs={aprData} />
                          </GridItem>
                          <GridItem>
                            <Flex flexGrow={2} justify="space-between" align="center">
                              <VStack flex={3}>
                                {pool.allApr[field].slice(0, 3).map(({ apr, isTradingFee, token }, idx) => (
                                  <Flex
                                    w="full"
                                    key={`reward-${isTradingFee ? 'Trade Fees' : token?.symbol}`}
                                    justify="space-between"
                                    align="center"
                                  >
                                    <Flex
                                      fontSize="xs"
                                      fontWeight="normal"
                                      color={colors.textSecondary}
                                      justify="flex-start"
                                      align="center"
                                    >
                                      <Box rounded="full" bg={aprColors[idx]} w="7px" h="7px" mr="8px" />
                                      {isTradingFee ? 'Trade Fees' : token?.symbol}
                                    </Flex>
                                    <Box fontSize="xs" color={colors.textPrimary}>
                                      {formatToRawLocaleStr(toAPRPercent(Number(apr)))}
                                    </Box>
                                  </Flex>
                                ))}
                              </VStack>
                            </Flex>
                          </GridItem>
                        </Grid>
                      </Flex>
                    }
                  >
                    <Flex align="center" gap={1} w="full" justify="center">
                      <Text fontSize="xl" fontWeight="500" color={colors.secondary}>
                        {formatToRawLocaleStr(toAPRPercent(pool.totalApr[field]))} {t('APR')}
                      </Text>
                      <QuestionCircleIcon opacity={1} color={colors.textSecondary} />
                    </Flex>
                  </Tooltip>
                </Flex>
              </VStack>
              {/* Body part */}
              <VStack spacing={2} w="full">
                <HStack justify="space-between" w="full">
                  <Text fontSize="sm" color={colors.textSubtle}>
                    {t('Fee Tier')}
                  </Text>
                  <Tooltip
                    label={
                      <Flex maxW="216px">
                        <Text fontSize="sm">
                          <Highlight query="concentrated" styles={{ fontWeight: '700', color: `${colors.textSecondary}` }}>
                            {t('This is a %type% with a %feeRate%% fee tier', {
                              feeRate: formatToRawLocaleStr(pool.feeRate * 100),
                              type:
                                pool.type === 'Concentrated'
                                  ? t('V3 concentrated liquidity pool (CLMM)')
                                  : t('V2 standard liquidity pool (CPMM)')
                            })}
                          </Highlight>
                        </Text>
                      </Flex>
                    }
                  >
                    <Tag size="sm" variant="rounded">
                      {formatToRawLocaleStr(toPercentString(pool.feeRate * 100))}
                    </Tag>
                  </Tooltip>
                </HStack>
                <HStack justify="space-between" w="full">
                  <Text fontSize="sm" color={colors.textSubtle}>
                    {`${t('Volume')} ${timeBase}`}
                  </Text>
                  <Text fontSize="sm" color={colors.textPrimary}>
                    {formatCurrency(timeData.volume, { symbol: '$', decimalPlaces: 2 })}
                  </Text>
                </HStack>
                <HStack justify="space-between" w="full">
                  <Text fontSize="sm" color={colors.textSubtle}>
                    {`${t('Fees')} ${timeBase}`}
                  </Text>
                  <Text fontSize="sm" color={colors.textPrimary}>
                    {formatCurrency(timeData.volumeFee, { symbol: '$', decimalPlaces: 2 })}
                  </Text>
                </HStack>
                <HStack justify="space-between" w="full">
                  <Text fontSize="sm" color={colors.textSubtle}>
                    {t(`TVL`)}
                  </Text>
                  <Text fontSize="sm" color={colors.textPrimary}>
                    {formatCurrency(pool.tvl, { symbol: '$', decimalPlaces: 2 })}
                  </Text>
                </HStack>
                <HStack justify="space-between" w="full">
                  <Text fontSize="sm" color={colors.textSecondary}>
                    {t(`Rewards`)}
                  </Text>
                  <PoolListItemRewardStack rewards={pool.weeklyRewards} />
                </HStack>
              </VStack>

              <VStack w="full" spacing={1}>
                <HStack justify="center" align="center" color={colors.secondary}>
                  <Button variant="ghost" display="block" width="100%" onClick={handleOpenChart}>
                    <HStack>
                      <Text fontSize="md" fontWeight="500">
                        {t('View Chart')}
                      </Text>
                      <PulseIcon />
                    </HStack>
                  </Button>
                  <Button variant="ghost" display="block" width="100%" onClick={onClickSwap}>
                    <HStack>
                      <Text fontSize="md" fontWeight="500">
                        {t('Swap')}
                      </Text>
                      <SwapPoolItemIcon color={colors.textSubtle} />
                    </HStack>
                  </Button>
                </HStack>
                <Button display="block" width="100%" onClick={onClickDeposit}>
                  {t('Deposit')}
                </Button>
              </VStack>
            </VStack>
          </PanelCard>
        </Desktop>
        <Mobile>
          <PanelCard overflow="hidden" borderRadius="12px" px={4} py={0}>
            <Flex justify="space-between" py={4}>
              <Box>
                <HStack spacing={2}>
                  <TokenAvatarPair token1={baseToken} token2={quoteToken} size="md" />
                  <Flex direction="column" gap={1}>
                    <HStack spacing={1}>
                      <Text fontWeight="500">
                        {baseToken?.symbol}/{quoteToken?.symbol}
                      </Text>
                      <StarIcon
                        selected={isFavorite}
                        onClick={(e) => {
                          e.stopPropagation()
                          onFavoriteClick()
                        }}
                      />
                    </HStack>
                    <HStack spacing="6px">
                      <Tag size="sm" variant="rounded">
                        {formatToRawLocaleStr(toPercentString(pool.feeRate * 100))}
                      </Tag>
                      {pool.isOpenBook ? (
                        <Tag size="sm" variant="rounded">
                          <OpenBookIcon />
                        </Tag>
                      ) : null}
                    </HStack>
                  </Flex>
                </HStack>
              </Box>
              <Box minW="85px" mr={4}>
                <Flex flexWrap="wrap" mb={2}>
                  <Text overflowWrap="break-word" wordBreak="break-word" fontWeight="500">
                    {formatToRawLocaleStr(toAPRPercent(timeData.apr))}
                  </Text>
                  <HStack ml={1} spacing="-7%">
                    {pool.weeklyRewards.map((reward) => (
                      <TokenAvatar key={`pool-list-item-reward-${reward.token.address}`} token={reward.token} size="xs" />
                    ))}
                  </HStack>
                </Flex>

                <PoolListItemAprLine aprData={aprData} />
              </Box>
            </Flex>

            <Box flexGrow={1} height="1px" color={colors.textTertiary} opacity={0.2} bg={colors.dividerDashGradient} />

            <Flex py={4} justify="space-between">
              <Flex flex={3} direction="column">
                <Text fontSize="xs" color={colors.textTertiary}>
                  {t('TVL')}
                </Text>
                <Text fontSize="sm" color={colors.textSubtle}>
                  {formatCurrency(pool.tvl, { symbol: '$', decimalPlaces: 0 })}
                </Text>
              </Flex>
              <Flex flex={3} direction="column">
                <Text fontSize="xs" color={colors.textTertiary}>
                  {`${t('Volume')} ${timeBase}`}
                </Text>
                <Text fontSize="sm" color={colors.textSubtle}>
                  {formatCurrency(timeData.volume, { decimalPlaces: 0 })}
                </Text>
              </Flex>
              <Flex flex={2} direction="column">
                <Text fontSize="xs" color={colors.textTertiary}>
                  {`${t('Fees')} ${timeBase}`}
                </Text>
                <Text fontSize="sm" color={colors.textSubtle}>
                  {formatCurrency(timeData.volumeFee, { decimalPlaces: 0 })}
                </Text>
              </Flex>
            </Flex>
          </PanelCard>
        </Mobile>
      </Box>

      <Mobile>
        <PoolDetailMobileDrawer
          poolId={pool.id}
          pairName={pool.poolName}
          isOpen={isPoolDetailOpen}
          baseToken={baseToken}
          quoteToken={quoteToken}
          isFavorite={isFavorite}
          onFavoriteClick={onFavoriteClick}
          feeTier={pool.feeRate * 100}
          isOpenBook={pool.isOpenBook}
          onClose={onPoolDetailClose}
          onDeposit={onClickDeposit}
          timeBase={timeBase}
          volume={formatCurrency(timeData.volume, { symbol: '$', decimalPlaces: 2 })}
          fees={formatCurrency(timeData.volumeFee, { symbol: '$', decimalPlaces: 2 })}
          tvl={formatCurrency(pool.tvl, { symbol: '$', decimalPlaces: 2 })}
          aprData={aprData}
          weeklyRewards={pool.weeklyRewards}
          isEcosystem={pool.rewardDefaultPoolInfos === 'Ecosystem'}
        />
      </Mobile>
    </>
  )
}
