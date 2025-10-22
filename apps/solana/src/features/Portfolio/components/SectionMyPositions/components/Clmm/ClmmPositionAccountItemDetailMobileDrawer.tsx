import { useEffect, useMemo, useState } from 'react'
import {
  Button,
  Badge,
  Box,
  Flex,
  Text,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerOverlay,
  HStack,
  SimpleGrid,
  VStack,
  useDisclosure
} from '@chakra-ui/react'
import Decimal from 'decimal.js'
import { useTranslation } from '@pancakeswap/localization'
import { ApiV3Token } from '@pancakeswap/solana-core-sdk'
import { FormattedPoolInfoConcentratedItem, AprKey, timeBasisOptions } from '@/hooks/pool/type'
import useClmmBalance, { ClmmPosition } from '@/hooks/portfolio/clmm/useClmmBalance'
import MinusIcon from '@/icons/misc/MinusIcon'
import PlusIcon from '@/icons/misc/PlusIcon'
import Close from '@/icons/misc/Close'
import LockIcon from '@/icons/misc/LockIcon'
import { colors } from '@/theme/cssVariables'
import { AprData } from '@/features/Clmm/utils/calApr'
import { useEvent } from '@/hooks/useEvent'
import AddressChip from '@/components/AddressChip'
import TokenAvatar from '@/components/TokenAvatar'
import LiquidityChartRangeInput from '@/features/Clmm/components/LiquidityChartRangeInput'
import useTokenPrice from '@/hooks/token/useTokenPrice'
import { formatCurrency, formatToRawLocaleStr } from '@/utils/numberish/formatter'
import toPercentString from '@/utils/numberish/toPercentString'
import { getTimeBasis } from '@/utils/time'
import { debounce } from '@/utils/functionMethods'
import { onWindowSizeChange } from '@/utils/dom/onWindowSizeChange'
import { QuestionToolTip } from '@/components/QuestionToolTip'
import AprMDSwitchWidget from '@/components/AprMDSwitchWidget'
import Tabs from '@/components/Tabs'
import { PoolListItemAprLine } from '@/features/Pools/components/PoolListItemAprLine'
import { panelCard } from '@/theme/cssBlocks'

import { BreakdownRewardInfo } from '@/hooks/pool/clmm/useFetchClmmRewardInfo'
import PoolInfoDrawerFace from './ClmmPositionAccountItemDetail/PoolInfoDrawerFace'
import EstimatedApr from './ClmmPositionAccountItemDetail/EstimatedApr'
import PendingYield from './ClmmPositionAccountItemDetail/PendingYield'

type DetailProps = {
  poolInfo: FormattedPoolInfoConcentratedItem
  position: ClmmPosition
  aprData: AprData
  timeBasis: AprKey
  onTimeBasisChange?: (val: AprKey) => void
  nftMint: string
  totalPendingYield: string
  baseIn: boolean
  hasReward?: boolean
  rewardInfos: { mint: ApiV3Token; amount: string; amountUSD: string }[]
  breakdownRewardInfo: BreakdownRewardInfo
  isLock?: boolean
  isRewardLoading?: boolean
  onHarvest: (props: { onSend?: () => void; onFinally?: () => void }) => void
  onClickCloseButton: (props: { onSend?: () => void; onFinally?: () => void }) => void
  onClickMinusButton: () => void
  onClickPlusButton: () => void
  onClickViewTrigger: () => void
}

const emptyObj = {}

export default function ClmmPositionAccountItemDetailMobileDrawer({
  poolInfo,
  position,
  nftMint,
  aprData,
  totalPendingYield,
  baseIn,
  timeBasis,
  onTimeBasisChange,
  hasReward,
  isLock,
  isRewardLoading,
  rewardInfos,
  breakdownRewardInfo,
  onHarvest,
  onClickCloseButton,
  onClickMinusButton,
  onClickPlusButton,
  onClickViewTrigger
}: DetailProps) {
  const { t } = useTranslation()
  const { isOpen: isLoading, onOpen: onSend, onClose: onFinally } = useDisclosure()
  const { isOpen: isCloseLoading, onOpen: onCloseSend, onClose: onCloseFinally } = useDisclosure()
  const [chartTag, setChartTag] = useState(Date.now())
  const { getPriceAndAmount } = useClmmBalance({})
  const { data: tokenPrices } = useTokenPrice({
    mintList: [poolInfo.mintA.address, poolInfo.mintB.address]
  })
  const positionDetailInfo = getPriceAndAmount({ poolInfo, position })

  const [price, timePriceMin, timePriceMax] = useMemo(
    () =>
      baseIn
        ? [poolInfo.price, poolInfo.day.priceMin, poolInfo.day.priceMax]
        : [
            new Decimal(1).div(poolInfo.price).toNumber(),
            poolInfo.day.priceMax ? new Decimal(1).div(poolInfo.day.priceMax).toNumber() : 0,
            poolInfo.day.priceMin ? new Decimal(1).div(poolInfo.day.priceMin).toNumber() : 0
          ],
    [baseIn, poolInfo.day.priceMax, poolInfo.day.priceMin, poolInfo.price]
  )

  const [volumeA, volumeB, totalVolume] = useMemo(() => {
    const priceA = tokenPrices[poolInfo.mintA.address]?.value
    const priceB = tokenPrices[poolInfo.mintB.address]?.value
    const validPriceA = priceA !== undefined && priceA >= 0 ? priceA : 0
    const validPriceB = priceB !== undefined && priceB >= 0 ? priceB : 0
    const volA = positionDetailInfo.amountA.mul(validPriceA)
    const volB = positionDetailInfo.amountB.mul(validPriceB)
    return [volA, volB, volA.add(volB)]
  }, [poolInfo.mintA.address, poolInfo.mintB.address, positionDetailInfo.amountA, positionDetailInfo.amountB, tokenPrices])

  const timeBasisIdx = 0

  const [priceLower, priceUpper, recommendDecimal] = useMemo(() => {
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
    return [
      priceLower.toString(),
      priceUpper.toString(),
      Math.max(poolInfo.recommendDecimal(priceLower), poolInfo.recommendDecimal(priceUpper))
    ]
  }, [baseIn, positionDetailInfo.priceLower, positionDetailInfo.priceUpper, poolInfo])

  const inRange = new Decimal(priceLower).lt(price) && new Decimal(priceUpper).gt(price)

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

  const handleClose = useEvent(() => {
    onClickCloseButton({
      onSend: onCloseSend,
      onFinally: onCloseFinally
    })
  })

  return (
    <Drawer isOpen variant="popFromBottom" placement="bottom" autoFocus={false} returnFocusOnClose={false} onClose={onClickViewTrigger}>
      <DrawerOverlay />
      <DrawerContent bg={colors.backgroundAlt}>
        <DrawerBody py={6}>
          <VStack gap={4}>
            <PoolInfoDrawerFace poolInfo={poolInfo} baseIn={baseIn} position={position} />
            <Flex direction="column" gap={4} justify="center" py={5} px={4} w="full" {...panelCard} rounded="2xl">
              {/* chart */}
              <Box flex={1}>
                <HStack justifyContent="center" gap={2} color={colors.textSubtle}>
                  <Text fontSize="xs">{t('Current Price')}</Text>
                  <Text fontSize="xs">
                    <Text as="span" color={colors.textPrimary} fontWeight="medium">
                      {baseIn
                        ? formatCurrency(poolInfo.price, {
                            decimalPlaces: poolInfo.recommendDecimal(poolInfo.price)
                          })
                        : formatCurrency(new Decimal(1).div(poolInfo.price).toString(), {
                            decimalPlaces: poolInfo.recommendDecimal(new Decimal(1).div(poolInfo.price).toString())
                          })}
                    </Text>{' '}
                    <Text as="span">
                      {t('%subA% per %subB%', {
                        subA: poolInfo[baseIn ? 'mintB' : 'mintA'].symbol,
                        subB: poolInfo[baseIn ? 'mintA' : 'mintB'].symbol
                      })}
                    </Text>
                  </Text>
                </HStack>
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
                />

                {/* info head */}
                <HStack fontSize="sm" justifyContent="space-between" mt={4} color={colors.textSubtle}>
                  <VStack alignItems="flex-start">
                    <Text>{t('TVL')}</Text>
                    <Text color={colors.textPrimary}>
                      {formatCurrency(poolInfo.tvl, { symbol: '$', abbreviated: true, decimalPlaces: 2 })}
                    </Text>
                  </VStack>

                  <VStack alignItems="flex-start">
                    <Text>
                      {getTimeBasis(timeBasisIdx)} {t('Volume')}
                    </Text>
                    <Text color={colors.textPrimary}>
                      {formatCurrency(poolInfo.day.volume, { symbol: '$', abbreviated: true, decimalPlaces: 2 })}
                    </Text>
                  </VStack>
                </HStack>
              </Box>

              {/* info detail */}
              <VStack align="stretch" alignSelf={['unset', 'end']} fontSize="sm" flex={1} spacing={4} color={colors.textSubtle}>
                <VStack align="stretch" spacing={1.5}>
                  <Flex gap={2} justifyContent="space-between">
                    <HStack gap={1}>
                      <Text>{t('My Position')}</Text>
                      {isLock && <LockIcon />}
                    </HStack>
                    <Box>{formatCurrency(totalVolume.toString(), { symbol: '$', decimalPlaces: 2 })}</Box>
                  </Flex>
                  <Flex gap={2} justifyContent="space-between">
                    <HStack gap={1}>
                      <TokenAvatar size="sm" token={poolInfo.mintA} />
                      <Text color={colors.textPrimary}>
                        {formatCurrency(positionDetailInfo.amountA, { decimalPlaces: poolInfo.mintA.decimals })}
                      </Text>
                      <Text>{poolInfo.mintA.symbol}</Text>
                    </HStack>
                    <Text color={colors.textPrimary} textAlign="right">
                      {formatCurrency(volumeA, { symbol: '$', decimalPlaces: 2 })}
                    </Text>
                  </Flex>
                  <Flex gap={2} justifyContent="space-between">
                    <HStack gap={1}>
                      <TokenAvatar size="sm" token={poolInfo.mintB} />
                      <Text color={colors.textPrimary}>
                        {formatCurrency(positionDetailInfo.amountB, { decimalPlaces: poolInfo.mintB.decimals })}
                      </Text>
                      <Text>{poolInfo.mintB.symbol}</Text>
                    </HStack>
                    <Text color={colors.textPrimary} textAlign="right">
                      {formatCurrency(volumeB, { symbol: '$', decimalPlaces: 2 })}
                    </Text>
                  </Flex>
                </VStack>

                <VStack align="stretch" spacing={1.5}>
                  <HStack>
                    <Text>{t('My Range')}</Text>
                    <Badge variant={inRange ? 'ok' : 'error'}>{inRange ? t('In Range') : t('Out of Range')}</Badge>
                  </HStack>

                  <HStack>
                    <Text fontWeight="medium" color={colors.textPrimary}>
                      {formatCurrency(new Decimal(priceLower), { decimalPlaces: recommendDecimal })} -{' '}
                      {formatCurrency(new Decimal(priceUpper), { decimalPlaces: recommendDecimal })}
                    </Text>
                    <Text>
                      {poolInfo[baseIn ? 'mintB' : 'mintA'].symbol} per {poolInfo[baseIn ? 'mintA' : 'mintB'].symbol}
                    </Text>
                  </HStack>
                </VStack>

                <HStack wordBreak="break-all">
                  <Text>{t('NFT Mint Address')}: </Text>
                  <AddressChip
                    address={nftMint}
                    canCopy
                    canExternalLink
                    textProps={{
                      color: colors.primary60,
                      fontWeight: 600
                    }}
                    iconProps={{ color: colors.primary60 }}
                  />
                </HStack>
              </VStack>
            </Flex>
            <Flex p={4} direction="column" justify="space-between" gap={2} {...panelCard} w="full" rounded="2xl" fontSize="sm">
              <HStack justify="space-between" direction="column" alignItems="start">
                <HStack spacing={2}>
                  <Text color={colors.textPrimary} fontWeight={600}>
                    {t('Estimated APR')}
                  </Text>
                  <AprMDSwitchWidget />
                </HStack>
                <Tabs size="xs" items={timeBasisOptions} onChange={onTimeBasisChange} variant="subtle" />
              </HStack>
              <SimpleGrid
                gridTemplate={`
                  "value tokens" auto
                  "line  tokens" auto / .5fr 1fr
                `}
                alignItems="center"
                columnGap={3}
              >
                <EstimatedApr timeAprData={poolInfo.allApr} aprData={aprData} timeBasis={timeBasis} poolId={poolInfo.id} />
              </SimpleGrid>
            </Flex>
            <Flex direction="column" justify="space-between" gap={2} {...panelCard} w="full" rounded="2xl" fontSize="sm">
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
            {isLock ? null : (
              <HStack w="full" spacing={4}>
                {position.liquidity.isZero() ? (
                  <CloseButton isLoading={isCloseLoading} onClick={handleClose} />
                ) : (
                  <MinusButton
                    isLoading={false}
                    onClick={() => {
                      onClickViewTrigger()
                      onClickMinusButton()
                    }}
                  />
                )}
                <PlusButton
                  isLoading={false}
                  onClick={() => {
                    onClickViewTrigger()
                    onClickPlusButton()
                  }}
                />
              </HStack>
            )}
          </VStack>
        </DrawerBody>
        <DrawerFooter>
          <Button w="full" color={colors.primary} variant="ghost" onClick={onClickViewTrigger}>
            Close
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

function CloseButton(props: { onClick: () => void; isLoading: boolean }) {
  return (
    <Button
      flex={1}
      isLoading={props.isLoading}
      onClick={props.onClick}
      variant="outline"
      borderColor={colors.primary}
      color={colors.primary60}
      borderRadius="12px"
    >
      <Close width={10} height={10} color={colors.primary60} />
    </Button>
  )
}

function MinusButton(props: { onClick: () => void; isLoading: boolean }) {
  return (
    <Button
      flex={1}
      isLoading={props.isLoading}
      onClick={props.onClick}
      variant="outline"
      borderColor={colors.primary}
      color={colors.primary60}
      borderRadius="12px"
    >
      <MinusIcon color={colors.primary60} />
    </Button>
  )
}

function PlusButton(props: { onClick: () => void; isLoading: boolean }) {
  return (
    <Button
      flex={1}
      isLoading={props.isLoading}
      onClick={props.onClick}
      borderColor={colors.primary}
      bg={colors.primary}
      borderRadius="12px"
    >
      <PlusIcon color={colors.backgroundAlt} />
    </Button>
  )
}
