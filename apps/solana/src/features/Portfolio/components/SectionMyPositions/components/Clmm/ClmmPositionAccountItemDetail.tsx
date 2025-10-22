import { Box, Collapse, Divider, Flex, HStack, Text, useDisclosure, VStack } from '@chakra-ui/react'
import { ApiV3Token } from '@pancakeswap/solana-core-sdk'
import Decimal from 'decimal.js'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from '@pancakeswap/localization'
import BN from 'bn.js'
import AddressChip from '@/components/AddressChip'
import TokenAvatar from '@/components/TokenAvatar'
import LiquidityChartRangeInput from '@/features/Clmm/components/LiquidityChartRangeInput'
import { AprData } from '@/features/Clmm/utils/calApr'
import { AprKey, FormattedPoolInfoConcentratedItem } from '@/hooks/pool/type'
import useClmmBalance, { ClmmPosition } from '@/hooks/portfolio/clmm/useClmmBalance'
import useTokenPrice from '@/hooks/token/useTokenPrice'
import { useEvent } from '@/hooks/useEvent'
import { colors } from '@/theme/cssVariables'
import { onWindowSizeChange } from '@/utils/dom/onWindowSizeChange'
import { debounce } from '@/utils/functionMethods'
import { formatCurrency } from '@/utils/numberish/formatter'
import { panelCard } from '@/theme/cssBlocks'
import { BreakdownRewardInfo } from '@/hooks/pool/clmm/useFetchClmmRewardInfo'
import EstimatedApr from './ClmmPositionAccountItemDetail/EstimatedApr'
import PendingYield from './ClmmPositionAccountItemDetail/PendingYield'

type DetailProps = {
  isViewOpen: boolean
  poolInfo: FormattedPoolInfoConcentratedItem
  timeBasis: AprKey
  onTimeBasisChange?: (val: AprKey) => void
  aprData: AprData
  position: ClmmPosition
  nftMint: string
  totalPendingYield: string
  baseIn: boolean
  hasReward: boolean
  rewardInfos: { mint: ApiV3Token; amount: string; amountUSD: string }[]
  onHarvest: (props: { onSend?: () => void; onFinally?: () => void }) => void
  breakdownRewardInfo: BreakdownRewardInfo
  isRewardLoading: boolean
}

const emptyObj = {}

export default function ClmmPositionAccountItemDetail({
  isViewOpen,
  poolInfo,
  position,
  timeBasis,
  aprData,
  nftMint,
  totalPendingYield,
  baseIn,
  hasReward,
  rewardInfos,
  onTimeBasisChange,
  onHarvest,
  breakdownRewardInfo,
  isRewardLoading
}: DetailProps) {
  const { isOpen: isLoading, onOpen: onSend, onClose: onFinally } = useDisclosure()
  const { t } = useTranslation()
  const [chartTag, setChartTag] = useState(Date.now())

  const { getPriceAndAmount } = useClmmBalance({})
  const { data: tokenPrices } = useTokenPrice({
    mintList: [poolInfo.mintA.address, poolInfo.mintB.address]
  })
  const positionDetailInfo = getPriceAndAmount({ poolInfo, position })
  const price = baseIn ? poolInfo.price : new Decimal(1).div(poolInfo.price).toNumber()
  const timePriceMin = baseIn ? poolInfo.day.priceMin : poolInfo.day.priceMax ? new Decimal(1).div(poolInfo.day.priceMax).toNumber() : 0
  const timePriceMax = baseIn ? poolInfo.day.priceMax : poolInfo.day.priceMin ? new Decimal(1).div(poolInfo.day.priceMin).toNumber() : 0

  const priceA = tokenPrices[poolInfo.mintA.address]?.value || 0
  const priceB = tokenPrices[poolInfo.mintB.address]?.value || 0
  const validPriceA = priceA !== undefined && priceA >= 0 ? priceA : 0
  const validPriceB = priceB !== undefined && priceB >= 0 ? priceB : 0

  const volumeA = positionDetailInfo.amountA.mul(validPriceA)
  const volumeB = positionDetailInfo.amountB.mul(validPriceB)

  const [priceLower, priceUpper] = useMemo(() => {
    if (baseIn)
      return [
        positionDetailInfo.priceLower.price.toString(),
        positionDetailInfo.priceUpper.price.toString(),
        Math.max(
          poolInfo.recommendDecimal(positionDetailInfo.priceLower.price),
          poolInfo.recommendDecimal(positionDetailInfo.priceUpper.price)
        )
      ]
    const [priceLower, priceUpper] = [
      new Decimal(1).div(positionDetailInfo.priceUpper.price),
      new Decimal(1).div(positionDetailInfo.priceLower.price)
    ]
    return [priceLower.toString(), priceUpper.toString()]
  }, [baseIn, positionDetailInfo.priceLower, positionDetailInfo.priceUpper])

  useEffect(() => {
    const fn = debounce(() => setChartTag(Date.now()), 300)
    const { cancel } = onWindowSizeChange(fn)
    return cancel
  }, [])

  const handleHarvest = useEvent(() => {
    onHarvest({
      onSend,
      onFinally
    })
  })

  return (
    <Collapse in={isViewOpen} animateOpacity unmountOnExit>
      <Flex
        p={2}
        bg={colors.cardSecondary}
        border={`1px solid ${colors.cardBorder01}`}
        borderTop="none"
        borderRadius="xl"
        borderTopRadius="none"
      >
        <Flex flexDirection={['column', 'row']} w="full" gap={[2, 4]} borderRadius="xl" justify="center">
          {/* chart */}
          <Flex flexDir="column" {...panelCard} flex={[1, 1, 1.5]} py={2} px={4} justify="center">
            <LiquidityChartRangeInput
              key={chartTag}
              poolId={poolInfo.id}
              feeAmount={poolInfo.feeRate * 1000000}
              ticksAtLimit={emptyObj}
              price={price}
              priceLower={priceLower}
              priceUpper={priceUpper}
              timePriceMin={timePriceMin}
              timePriceMax={timePriceMax}
              interactive={false}
              baseIn={baseIn}
              autoZoom
              chartHeight={120}
            />
            {/* info head */}
            <Flex fontSize="xs" justifyContent="center" mt={3}>
              <VStack align="start" gap={1} flex={1}>
                <HStack width="100%" justifyContent="space-between" color={colors.textSubtle}>
                  <HStack>
                    <Box
                      style={{
                        width: '7px',
                        height: '7px',
                        left: '0px',
                        top: '6px',
                        background: colors.success,
                        borderRadius: '10px'
                      }}
                    />
                    <Text>{t('Current Price')}: </Text>
                  </HStack>
                  <Text fontWeight="medium">
                    <Text as="span" color={colors.textPrimary}>
                      {baseIn
                        ? formatCurrency(poolInfo.price, {
                            decimalPlaces: poolInfo.recommendDecimal(poolInfo.price)
                          })
                        : formatCurrency(new Decimal(1).div(poolInfo.price).toString(), {
                            decimalPlaces: poolInfo.recommendDecimal(new Decimal(1).div(poolInfo.price).toString())
                          })}
                    </Text>{' '}
                    {t('%subA% per %subB%', {
                      subA: poolInfo[baseIn ? 'mintB' : 'mintA'].symbol,
                      subB: poolInfo[baseIn ? 'mintA' : 'mintB'].symbol
                    })}
                  </Text>
                </HStack>

                <HStack width="100%" justifyContent="space-between" color={colors.textSubtle}>
                  <HStack>
                    <Box
                      style={{
                        width: '7px',
                        height: '7px',
                        left: '0px',
                        top: '6px',
                        background: colors.primary,
                        borderRadius: '10px'
                      }}
                    />
                    <Text>{t('%time% Price Range', { time: '24h' })}: </Text>
                  </HStack>
                  <Text color={colors.textPrimary} fontWeight="medium">
                    {`[${formatCurrency(timePriceMin, {
                      decimalPlaces: poolInfo.poolDecimals
                    })}, ${formatCurrency(timePriceMax, {
                      decimalPlaces: poolInfo.poolDecimals
                    })}]`}
                  </Text>
                </HStack>
              </VStack>
            </Flex>
          </Flex>
          <Divider borderWidth="1px" borderColor={colors.textSubtle} opacity="0.2" orientation="vertical" />
          {/* info detail */}
          <VStack fontSize="sm" flex={[1, 1, 1]} spacing={3} py={[0, 0, 3]}>
            <Flex flexDirection="column" flex={1} w="full" gap={3} justifyContent="space-between">
              <Flex justifyContent="space-between">
                <HStack>
                  <TokenAvatar size="sm" token={poolInfo.mintA} />
                  <Text>{formatCurrency(positionDetailInfo.amountA, { decimalPlaces: poolInfo.mintA.decimals })}</Text>
                  <Text color={colors.textSubtle}>{poolInfo.mintA.symbol}</Text>
                </HStack>
                <Text textAlign="right" minW="79px">
                  {formatCurrency(volumeA, { symbol: '$', decimalPlaces: 2 })}
                </Text>
              </Flex>
              <Flex justifyContent="space-between">
                <HStack>
                  <TokenAvatar size="sm" token={poolInfo.mintB} />
                  <Text>{formatCurrency(positionDetailInfo.amountB, { decimalPlaces: poolInfo.mintB.decimals })}</Text>
                  <Text color={colors.textSubtle}>{poolInfo.mintB.symbol}</Text>
                </HStack>
                <Text textAlign="right" minW="79px">
                  {formatCurrency(volumeB, { symbol: '$', decimalPlaces: 2 })}
                </Text>
              </Flex>
              <Flex
                direction={['column', 'column', 'row']}
                wordBreak="break-all"
                color={colors.textSubtle}
                justifyContent="center"
                gap={0.5}
                pt={1}
              >
                <Text color={colors.textSubtle}>{t('NFT Mint Address')}: </Text>
                <AddressChip
                  address={nftMint}
                  canCopy
                  canExternalLink
                  textProps={{
                    color: colors.primary60
                  }}
                  iconProps={{
                    color: colors.primary60
                  }}
                />
              </Flex>
            </Flex>
            <Divider borderWidth="1px" borderColor={colors.textSubtle} opacity="0.2" />
            <Flex flex={1} flexDirection="column" w="full" justifyContent="space-between">
              <Flex justifyContent="space-between">
                <Text color={colors.textSubtle}> {t('TVL')}</Text>
                <Text color={colors.textPrimary}>{formatCurrency(poolInfo.tvl, { symbol: '$', abbreviated: true, decimalPlaces: 3 })}</Text>
              </Flex>
              <Flex justifyContent="space-between">
                <Text color={colors.textSubtle}>{t('24h Volume')}</Text>
                <Text color={colors.textPrimary}>
                  {formatCurrency(poolInfo.day.volume, { symbol: '$', abbreviated: true, decimalPlaces: 3 })}
                </Text>
              </Flex>
              <Flex justifyContent="space-between">
                <Text color={colors.textSubtle}>{t('24h Pool Fee')}</Text>
                <Text color={colors.textPrimary}>
                  {formatCurrency(poolInfo.day.volumeFee, { symbol: '$', abbreviated: true, decimalPlaces: 3 })}
                </Text>
              </Flex>
            </Flex>
          </VStack>
          <Divider borderWidth="1px" borderColor={colors.textSubtle} opacity="0.2" orientation="vertical" />
          <Flex direction="column" flex={[1, 1, 1]} gap={[0, 0, 4]} py={[0, 0, 3]} pr={[0, 0, 3]} w="full" overflow="hidden">
            <EstimatedApr
              timeAprData={poolInfo.allApr}
              aprData={aprData}
              timeBasis={timeBasis}
              onTimeBasisChange={onTimeBasisChange}
              poolId={poolInfo.id}
            />
            <PendingYield
              isLoading={isLoading}
              isRewardLoading={isRewardLoading}
              hasReward={hasReward}
              pendingYield={formatCurrency(totalPendingYield, { symbol: '$', decimalPlaces: 2 })}
              rewardInfos={rewardInfos}
              breakdownRewardInfo={breakdownRewardInfo}
              onHarvest={handleHarvest}
            />
          </Flex>
        </Flex>
      </Flex>
    </Collapse>
  )
}
