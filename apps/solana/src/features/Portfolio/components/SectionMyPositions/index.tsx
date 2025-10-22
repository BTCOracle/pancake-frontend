import { useRouter } from 'next/router'
import { useEffect, useRef, useState } from 'react'
import { Box, Button, Flex, Grid, GridItem, HStack, Heading, SimpleGrid, Text } from '@chakra-ui/react'
import { useTranslation } from '@pancakeswap/localization'
import { Skeleton } from '@pancakeswap/uikit'
import useAllPositionInfo, { PositionTabValues } from '@/hooks/portfolio/useAllPositionInfo'
import { useEvent } from '@/hooks/useEvent'
import { useStateWithUrl } from '@/hooks/useStateWithUrl'
import QuestionCircleIcon from '@/icons/misc/QuestionCircleIcon'
import { useAppStore } from '@/store/useAppStore'
import { panelCard } from '@/theme/cssBlocks'
import { colors } from '@/theme/cssVariables'
import { formatCurrency } from '@/utils/numberish/formatter'
import { getMintSymbol } from '@/utils/token'

import IntervalCircle, { IntervalCircleHandler } from '@/components/IntervalCircle'
import { QuestionToolTip } from '@/components/QuestionToolTip'
import TokenAvatar from '@/components/TokenAvatar'
import MyPositionTabStaked from './TabStaked'
import MyPositionTabStandard from './TabStandard'
import { ClmmMyPositionTabContent } from './TabClmm'

export default function SectionMyPositions() {
  const { t } = useTranslation()
  const { query } = useRouter()
  const [refreshTag, setRefreshTag] = useState(Date.now())
  const circleRef = useRef<IntervalCircleHandler>(null)
  const tabs: {
    value: PositionTabValues
    label: string
  }[] = [
    {
      value: 'concentrated',
      label: t('v3')
    },
    {
      value: 'standard',
      label: t('v2')
    }
  ]
  const connected = useAppStore((s) => s.connected)
  const owner = useAppStore((s) => s.publicKey)
  const isMobile = useAppStore((s) => s.isMobile)

  const defaultTab = (query.tab as string) || tabs[0].value

  const [currentTab, setCurrentTab] = useStateWithUrl(defaultTab, 'position_tab', {
    fromUrl: (v) => v,
    toUrl: (v) => v
  })

  const onTabChange = (tab: any) => {
    setCurrentTab(tab)
  }

  const isFocusClmmTab = currentTab === tabs[0].value
  const isFocusStandardTab = currentTab === tabs[1].value
  // for farm
  const isFocusStake = false

  const noRewardClmmPos = useRef<Set<string>>(new Set())
  const setNoRewardClmmPos = useEvent((poolId: string, isDelete?: boolean) => {
    if (isDelete) {
      noRewardClmmPos.current.delete(poolId)
      return
    }
    noRewardClmmPos.current.add(poolId)
  })

  useEffect(
    () => () => {
      noRewardClmmPos.current.clear()
    },
    [owner?.toBase58()]
  )

  const {
    handleHarvest,
    handleRefresh,
    farmLpBasedData,
    stakedFarmMap,
    allFarmBalances,
    clmmBalanceInfo,
    clmmLockInfo,
    isClmmLoading,
    isFarmLoading,
    rewardState,
    isSending
  } = useAllPositionInfo({ noRewardClmmPos: noRewardClmmPos.current })

  const currentRewardState = rewardState[currentTab as PositionTabValues]

  const handleRefreshAll = useEvent(() => {
    handleRefresh()
    setRefreshTag(Date.now())
  })

  const handleClick = useEvent(() => {
    circleRef.current?.restart()
    handleRefreshAll()
  })

  const enableFarm = true

  return (
    <>
      <Grid
        gridTemplate={[
          `
          "title  tabs  " auto
          "action action" auto / 1fr 1fr
        `,
          //   `
          //   "title " auto
          //   "tabs  " auto
          //   "action" auto / 1fr
          // `,
          `
          "title action " auto
          "tabs  tabs" auto / 1fr 1fr
        `
        ]}
        columnGap={3}
        rowGap={[3, 4]}
        mb={3}
        mt={[0, 6]}
        alignItems="center"
      >
        <GridItem area="title">
          <Flex gap="2" alignItems="center">
            <Heading id="my-position" fontSize="xl" fontWeight="600" color={colors.textSecondary}>
              {t('My positions')}
            </Heading>
            <IntervalCircle
              componentRef={circleRef}
              svgWidth={18}
              strokeWidth={3}
              trackStrokeColor={colors.textSubtle}
              trackStrokeOpacity={0.5}
              filledTrackStrokeColor={colors.secondary}
              onClick={handleClick}
              onEnd={handleRefreshAll}
            />
          </Flex>
        </GridItem>
        <GridItem area="action" justifySelf={['stretch', 'stretch', 'right']}>
          {enableFarm && connected ? (
            <Box {...panelCard} py="6px" px={4} borderRadius="12px">
              <HStack justify="space-between" gap={8}>
                <Flex gap={[0, 2]} direction={['column', 'row']} fontSize={['xs', 'sm']} align={['start', 'center']}>
                  <HStack gap={1}>
                    {(!currentRewardState.rewardInfo || currentRewardState.rewardInfo.length === 0) && (
                      <HStack gap={1}>
                        <Text whiteSpace="nowrap" color={colors.textSubtle}>
                          {t('Pending Yield')}
                        </Text>
                        {currentRewardState.isReady ? (
                          <Text color={colors.primary} fontWeight={600}>
                            {formatCurrency(currentRewardState.pendingReward, { symbol: '$', maximumDecimalTrailingZeroes: 4 })}
                          </Text>
                        ) : (
                          <Skeleton height="20px" width="100px" />
                        )}
                      </HStack>
                    )}
                    {isMobile && currentRewardState.rewardInfo.length > 0 && currentRewardState.isReady && (
                      <>
                        <QuestionToolTip
                          placement="left"
                          label={
                            <>
                              {currentRewardState.rewardInfo.map((r) => (
                                <Flex key={r.mint.address} alignItems="center" gap="1" my="2">
                                  <TokenAvatar key={`pool-reward-${r.mint.address}`} size="sm" token={r.mint} />
                                  <Text color={colors.primary}>
                                    {formatCurrency(r.amount, {
                                      maximumDecimalTrailingZeroes: 5
                                    })}
                                  </Text>
                                  <Text>{getMintSymbol({ mint: r.mint, transformSol: true })}</Text>
                                  <Text color={colors.primary}>({formatCurrency(r.amountUSD, { symbol: '$', decimalPlaces: 4 })})</Text>
                                </Flex>
                              ))}
                            </>
                          }
                          iconType="info"
                          iconProps={{ width: 10, height: 10, fill: colors.textSecondary }}
                        >
                          <HStack>
                            <Text whiteSpace="nowrap" color={colors.textSubtle}>
                              {t('Pending Yield')}
                            </Text>
                            <QuestionCircleIcon style={{ display: 'block' }} fill={colors.textSecondary} />
                          </HStack>
                          <Text color={colors.primary} fontWeight={600}>
                            {formatCurrency(currentRewardState.pendingReward, { symbol: '$', maximumDecimalTrailingZeroes: 4 })}
                          </Text>
                        </QuestionToolTip>
                      </>
                    )}
                  </HStack>
                  <HStack>
                    {!isMobile && currentRewardState.rewardInfo.length > 0 ? (
                      <>
                        <Text whiteSpace="nowrap" color={colors.textSubtle}>
                          {t('Pending Yield')}
                        </Text>
                        <Flex gap="2" alignItems="center" whiteSpace="nowrap">
                          {currentRewardState.isReady ? (
                            <>
                              <Text color={colors.primary} fontWeight={600}>
                                {formatCurrency(currentRewardState.pendingReward, { symbol: '$', maximumDecimalTrailingZeroes: 4 })}
                              </Text>
                              <QuestionToolTip
                                placement="bottom"
                                label={
                                  <>
                                    <Flex
                                      direction="column"
                                      maxHeight="450px"
                                      overflowY="auto"
                                      css={{
                                        scrollSnapType: 'x mandatory',
                                        scrollbarWidth: 'none',
                                        '&::-webkit-scrollbar': {
                                          display: 'none'
                                        }
                                      }}
                                    >
                                      {currentRewardState.rewardInfo.map((r) => (
                                        <Flex key={r.mint.address} alignItems="center" gap="1" my="2">
                                          <TokenAvatar key={`pool-reward-${r.mint.address}`} size="sm" token={r.mint} />
                                          <Text color={colors.primary}>
                                            {formatCurrency(r.amount, {
                                              maximumDecimalTrailingZeroes: 5
                                            })}
                                          </Text>
                                          <Text>{getMintSymbol({ mint: r.mint, transformSol: true })}</Text>
                                          <Text color={colors.primary}>
                                            ({formatCurrency(r.amountUSD, { symbol: '$', decimalPlaces: 4 })})
                                          </Text>
                                        </Flex>
                                      ))}
                                    </Flex>
                                  </>
                                }
                                iconType="info"
                                iconProps={{ width: 18, height: 18, fill: colors.textSecondary }}
                              />
                            </>
                          ) : (
                            <Skeleton height="20px" width="100px" />
                          )}
                        </Flex>
                      </>
                    ) : null}
                  </HStack>
                </Flex>
                <Button
                  size={['xs', 'md']}
                  minHeight={[7, 10]}
                  isLoading={isSending}
                  isDisabled={!currentRewardState.isReady}
                  onClick={() => handleHarvest({ tab: currentTab as PositionTabValues, zeroClmmPos: noRewardClmmPos.current })}
                >
                  {t('Harvest All')}
                </Button>
              </HStack>
            </Box>
          ) : null}
        </GridItem>
      </Grid>
      {connected ? (
        isFocusClmmTab ? (
          <ClmmMyPositionTabContent
            isLoading={isClmmLoading}
            clmmBalanceInfo={clmmBalanceInfo}
            lockInfo={clmmLockInfo}
            setNoRewardClmmPos={setNoRewardClmmPos}
            refreshTag={refreshTag}
          />
        ) : isFocusStandardTab ? (
          <MyPositionTabStandard
            isLoading={isFarmLoading}
            allFarmBalances={allFarmBalances}
            lpBasedData={farmLpBasedData}
            stakedFarmMap={stakedFarmMap}
            refreshTag={refreshTag}
          />
        ) : isFocusStake ? (
          <MyPositionTabStaked allFarmBalances={allFarmBalances} farmLpBasedData={farmLpBasedData} refreshTag={refreshTag} />
        ) : null
      ) : (
        <SimpleGrid {...panelCard} placeItems="center" bg={colors.backgroundLight} borderRadius="12px" py={12}>
          <Text my={8} color={colors.textTertiary} fontSize={['sm', 'md']}>
            {t('Connect wallet to see your positions.')}
          </Text>
        </SimpleGrid>
      )}
    </>
  )
}
