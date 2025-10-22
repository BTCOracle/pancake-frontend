import BN from 'bn.js'
import Decimal from 'decimal.js'
import { useTranslation } from '@pancakeswap/localization'
import { Badge, Button, Divider, Flex, HStack, Text, Tooltip, useDisclosure } from '@chakra-ui/react'
import { useMemo } from 'react'
import AprMDSwitchWidget from '@/components/AprMDSwitchWidget'
import { Desktop, Mobile } from '@/components/MobileDesktop'
import { FormattedPoolInfoConcentratedItem, AprKey } from '@/hooks/pool/type'
import useClmmBalance, { ClmmPosition } from '@/hooks/portfolio/clmm/useClmmBalance'
import Close from '@/icons/misc/Close'
import ChevronRightIcon from '@/icons/misc/ChevronRightIcon'
import ChevronDownIcon from '@/icons/misc/ChevronDownIcon'
import ChevronUpIcon from '@/icons/misc/ChevronUpIcon'
import MinusIcon from '@/icons/misc/MinusIcon'
import PlusIcon from '@/icons/misc/PlusIcon'
import { useAppStore } from '@/store'
import { colors } from '@/theme/cssVariables'
import { toAPRPercent } from '@/features/Pools/util'
import { formatCurrency, formatToRawLocaleStr } from '@/utils/numberish/formatter'
import { TokenPrice } from '@/hooks/token/useTokenPrice'
import { getPositionAprCore } from '@/features/Clmm/utils/calApr'
import { useEvent } from '@/hooks/useEvent'
import LockIcon from '@/icons/misc/LockIcon'
import { inputCard } from '@/theme/cssBlocks'

export default function ClmmPositionAccountItemFace({
  isViewOpen,
  isLock,
  poolInfo,
  poolLiquidity,
  tokenPrices,
  position,
  baseIn,
  hasReward,
  onHarvest,
  onClickCloseButton,
  onClickMinusButton,
  onClickPlusButton,
  onClickViewTrigger
}: {
  isViewOpen: boolean
  isLock: boolean
  poolInfo: FormattedPoolInfoConcentratedItem
  poolLiquidity?: BN
  tokenPrices: Record<string, TokenPrice>
  position: ClmmPosition
  baseIn: boolean
  hasReward: boolean
  onHarvest: (props: { onSend?: () => void; onFinally?: () => void }) => void
  onClickCloseButton: (props: { onSend?: () => void; onFinally?: () => void }) => void
  onClickMinusButton: () => void
  onClickPlusButton: () => void
  onClickViewTrigger: () => void
}) {
  const { t } = useTranslation()
  const { getPriceAndAmount } = useClmmBalance({})
  const { isOpen: isLoading, onOpen: onSend, onClose: onFinally } = useDisclosure()
  const isMobile = useAppStore((s) => s.isMobile)
  const chainTimeOffset = useAppStore((s) => s.chainTimeOffset)
  const aprMode = useAppStore((s) => s.aprMode)

  const handleClickClose = useEvent(() => {
    onClickCloseButton({
      onSend,
      onFinally
    })
  })

  const { priceLower, priceUpper, amountA, amountB } = getPriceAndAmount({ poolInfo, position })
  const priceA = tokenPrices[poolInfo.mintA.address]?.value
  const priceB = tokenPrices[poolInfo.mintB.address]?.value
  const validPriceA = priceA !== undefined && priceA >= 0 ? priceA : 0
  const validPriceB = priceB !== undefined && priceB >= 0 ? priceB : 0
  const totalVolume = amountA.mul(validPriceA).add(amountB.mul(validPriceB))

  const inRange = priceLower.price.lt(poolInfo.price) && priceUpper.price.gt(poolInfo.price)

  const isFullRange =
    position.tickLower === parseInt((-443636 / poolInfo.config.tickSpacing).toString()) * poolInfo.config.tickSpacing &&
    position.tickUpper === parseInt((443636 / poolInfo.config.tickSpacing).toString()) * poolInfo.config.tickSpacing

  const rangeValue = isFullRange
    ? t('Full Range')
    : baseIn
    ? `${formatCurrency(priceLower.price, {
        decimalPlaces: 6
      })} - ${formatCurrency(priceUpper.price, {
        decimalPlaces: 6
      })}`
    : `${formatCurrency(new Decimal(1).div(priceUpper.price), {
        decimalPlaces: 6
      })} - ${formatCurrency(new Decimal(1).div(priceLower.price), {
        decimalPlaces: 6
      })}`

  const rangeValueUnit = t(isMobile ? '%subA%/%subB%' : '%subA% per %subB%', {
    subA: poolInfo[baseIn ? 'mintB' : 'mintA'].symbol,
    subB: poolInfo[baseIn ? 'mintA' : 'mintB'].symbol
  })

  const apr = useMemo(
    () =>
      getPositionAprCore({
        poolInfo,
        positionAccount: position,
        poolLiquidity: poolLiquidity || new BN(0),
        tokenPrices,
        timeBasis: AprKey.Day,
        planType: aprMode,
        chainTimeOffsetMs: chainTimeOffset,
        inRange
      }),
    [poolInfo, position, poolLiquidity, tokenPrices, aprMode, chainTimeOffset, inRange]
  )
  return (
    <>
      <Desktop>
        <Flex
          bg={colors.input}
          borderRadius="xl"
          borderBottomRadius={isViewOpen ? 'none' : 'xl'}
          justifyContent="space-between"
          py={[2, 3]}
          px={[3, 5]}
          gap={[2, 4]}
          cursor="pointer"
          onClick={onClickViewTrigger}
          border={isViewOpen ? `1px solid ${colors.cardBorder01}` : '1px solid transparent'}
          borderBottomColor="transparent"
          _hover={{
            border: `1px solid ${colors.cardBorder01}`,
            borderBottomColor: isViewOpen ? 'transparent' : colors.cardBorder01
          }}
          direction={['column', 'row']}
        >
          <Flex align="center" flex="1.5" gap={3}>
            <Text fontWeight="medium" whiteSpace="nowrap">
              {rangeValue}
            </Text>
            {isFullRange ? null : (
              <Text color={colors.textSubtle} whiteSpace="nowrap">
                {rangeValueUnit}
              </Text>
            )}
            <Badge mr={['auto', 'unset']} variant={inRange ? 'ok' : 'error'}>
              {inRange ? t('In Range') : t('Out of Range')}
            </Badge>
          </Flex>
          <Flex flex="1" align="center" justify="space-between">
            <HStack>
              <Text whiteSpace="nowrap" color={colors.textSubtle}>
                {t('Position')}
              </Text>
              <Text whiteSpace="nowrap" display="flex" gap="1" alignItems="center" color={colors.textPrimary}>
                {formatCurrency(totalVolume.toString(), { symbol: '$', decimalPlaces: 2 })}
                {isLock ? <LockIcon /> : null}
              </Text>
            </HStack>
          </Flex>
          <Flex flex="1" align="center" justify="space-between">
            <HStack gap={2}>
              <Text whiteSpace="nowrap" color={colors.textSubtle}>
                {t('APR')}
              </Text>
              <Text whiteSpace="nowrap" color={colors.textPrimary}>
                {formatToRawLocaleStr(toAPRPercent(apr.apr))}
              </Text>
              <AprMDSwitchWidget color={colors.textSecondary} />
            </HStack>
            <HStack>
              {isLock ? (
                <Button
                  isLoading={isLoading}
                  isDisabled={!hasReward}
                  onClick={(e) => {
                    e.stopPropagation()
                    onHarvest({})
                  }}
                  size="sm"
                  fontSize="md"
                  variant="outline"
                >
                  {t('Harvest')}
                </Button>
              ) : (
                <>
                  {position.liquidity.isZero() ? (
                    <CloseButton isLoading={isLoading} onClick={handleClickClose} />
                  ) : (
                    <MinusButton isLoading={false} onClick={onClickMinusButton} />
                  )}
                  <PlusButton isLoading={false} onClick={onClickPlusButton} />
                </>
              )}

              {isViewOpen ? (
                <ChevronUpIcon className="up" width={24} height={24} color={colors.textSubtle} />
              ) : (
                <ChevronDownIcon className="down" width={24} height={24} color={colors.textSubtle} />
              )}
            </HStack>
          </Flex>
        </Flex>
      </Desktop>
      <Mobile>
        <Flex
          {...inputCard}
          flexDir="column"
          p="4"
          fontSize="sm"
          color={colors.textSubtle}
          justifyContent="space-between"
          gap={2}
          onClick={onClickViewTrigger}
        >
          <HStack justifyContent="space-between">
            <Badge variant={inRange ? 'ok' : 'error'}>{inRange ? t('In Range') : t('Out of Range')}</Badge>
            <ChevronRightIcon color={colors.textSubtle} />
          </HStack>
          <HStack justifyContent="space-between">
            <Text fontWeight="600" color={colors.textPrimary}>
              {rangeValue}
            </Text>
            {isFullRange ? null : <Text whiteSpace="nowrap">{rangeValueUnit}</Text>}
          </HStack>
          <HStack justifyContent="space-between">
            <Text>{t('Position')}</Text>
            <Text whiteSpace="nowrap" display="flex" gap="1" alignItems="center" color={colors.textPrimary} fontWeight={600}>
              {formatCurrency(totalVolume.toString(), { symbol: '$', decimalPlaces: 2 })}
              {isLock ? <LockIcon /> : null}
            </Text>
          </HStack>
          <HStack justifyContent="space-between">
            <Text whiteSpace="nowrap">{t('APR')}</Text>
            <Text whiteSpace="nowrap" color={colors.textPrimary}>
              {formatToRawLocaleStr(toAPRPercent(apr.apr))}
            </Text>
          </HStack>
        </Flex>
      </Mobile>
    </>
  )
}

function MinusButton(props: { onClick: () => void; isLoading: boolean }) {
  return (
    <Button
      onClick={(e) => {
        e.stopPropagation()
        props.onClick()
      }}
      isLoading={props.isLoading}
      variant="outline"
      size="xs"
      width={9}
      h="26px"
      px={0}
      backgroundImage=""
    >
      <MinusIcon color={colors.primary} />
    </Button>
  )
}

function PlusButton(props: { onClick: () => void; isLoading: boolean }) {
  return (
    <Button
      onClick={(e) => {
        e.stopPropagation()
        props.onClick()
      }}
      isLoading={props.isLoading}
      size="xs"
      w={9}
      h="26px"
      px={0}
      backgroundImage=""
    >
      <PlusIcon color={colors.buttonSolidText} />
    </Button>
  )
}

function CloseButton(props: { onClick: () => void; isLoading: boolean }) {
  const { t } = useTranslation()
  return (
    <Tooltip label={t('Close Position')}>
      <Button
        onClick={(e) => {
          e.stopPropagation()
          props.onClick()
        }}
        isLoading={props.isLoading}
        variant="outline"
        size="xs"
        width={9}
        h="26px"
        px={0}
      >
        <Close color={colors.primary} width={10} height={10} />
      </Button>
    </Tooltip>
  )
}
