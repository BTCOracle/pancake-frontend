import { Button } from '@pancakeswap/uikit'
import { useState, useCallback, useRef, useEffect } from 'react'
import { Minus, Plus } from 'react-feather'
import { ApiV3PoolInfoConcentratedItem, ApiV3Token, solToWSol } from '@pancakeswap/solana-core-sdk'
import { Box, Text, Flex, HStack, VStack, SimpleGrid, Skeleton } from '@chakra-ui/react'
import { shallow } from 'zustand/shallow'
import Decimal from 'decimal.js'
import { useTranslation } from '@pancakeswap/localization'

import DecimalInput from '@/components/DecimalInput'
import PanelCard from '@/components/PanelCard'
import Tabs from '@/components/Tabs'
import HorizontalSwitchSmallIcon from '@/icons/misc/HorizontalSwitchSmallIcon'
import EditIcon from '@/icons/misc/EditIcon'
import { QuestionToolTip } from '@/components/QuestionToolTip'
import { useClmmStore } from '@/store/useClmmStore'
import { debounce } from '@/utils/functionMethods'
import { colors } from '@/theme/cssVariables/colors'
import { wSolToSolString } from '@/utils/token'
import { Desktop, Mobile } from '@/components/MobileDesktop'
import { useEvent } from '@/hooks/useEvent'
import { formatCurrency, formatToRawLocaleStr } from '@/utils/numberish/formatter'
import { extractNumberOnly } from '@/utils/numberish/regex'
import { inputCard } from '@/theme/cssBlocks'

import { usePriceRangeValidate } from '../useValidate'
import { TickData } from './type'

export enum Side {
  Left = 'left',
  Right = 'right'
}

export const IconStyle = {
  cursor: 'pointer',
  color: colors.primary60,
  border: `2px solid ${colors.primary60}`,
  strokeWidth: 3,
  width: '20px',
  height: '20px',
  borderRadius: '50%'
}

export const RangeInputStyle = {
  ctr: { border: 'none', borderRadius: 'none', userSelect: 'none' },
  input: { h: '24px', textAlign: 'center', fontWeight: 500, fontSize: 'sm' },
  inputGroup: {
    display: 'flex',
    h: '24px',
    lineHeight: '24px',
    p: 0
  }
}

interface Props {
  initState?: {
    currentPrice?: string
    priceRange?: [string, string]
  }
  token1: ApiV3Token
  token2: ApiV3Token
  tokenPrices: Record<string, { value: number }>
  isPriceLoading: boolean
  tempCreatedPool?: ApiV3PoolInfoConcentratedItem
  baseIn: boolean
  completed: boolean
  onPriceChange: (props: { price: string }) => void
  onConfirm: (props: { price: string; isFullRange?: boolean } & Required<TickData>) => void
  onEdit: (step: number) => void
  onSwitchBase: (baseIn: boolean) => void
}

Decimal.set({
  toExpNeg: -10
})

export default function SetPriceAndRange({
  completed,
  initState,
  tokenPrices,
  isPriceLoading,
  token1,
  token2,
  tempCreatedPool,
  baseIn,
  onPriceChange,
  onSwitchBase,
  onConfirm,
  onEdit
}: Props) {
  const { t } = useTranslation()
  const [getPriceAndTick, getTickPrice] = useClmmStore((s) => [s.getPriceAndTick, s.getTickPrice], shallow)
  const [priceReverse, setPriceReverse] = useState(false)
  const [rangeMode, setRangeMode] = useState<'full' | 'custom'>('full')
  const [currentPrice, setCurrentPrice] = useState<string>(initState?.currentPrice || '')
  const [priceRange, setPriceRange] = useState<[string, string]>(initState?.priceRange || ['', ''])
  const switchRef = useRef(false)
  const focusMintARef = useRef(true)
  const priceRangeRef = useRef(priceRange)
  const hasInitPriceRange = !!initState?.priceRange?.[0] && !!initState?.priceRange?.[1]
  priceRangeRef.current = priceRange
  const isFullRange = rangeMode === 'full'

  const handleFocus = useEvent((isMintA: boolean) => {
    focusMintARef.current = isMintA
  })

  const error = usePriceRangeValidate({
    focusMintA: focusMintARef.current,
    currentPrice,
    priceRange: isFullRange ? ['1', '100'] : priceRange
  })

  const [tokenBase, tokenQuote] = [
    baseIn ? tempCreatedPool?.mintB || token2 : tempCreatedPool?.mintA || token1,
    baseIn ? tempCreatedPool?.mintA || token1 : tempCreatedPool?.mintB || token2
  ]

  const [priceBase, priceQuote] = [
    tokenPrices[solToWSol(tokenBase.address).toString()],
    tokenPrices[solToWSol(tokenQuote.address).toString()]
  ]

  const onlinePrice =
    tokenBase && tokenQuote && priceBase?.value > 0 && priceQuote?.value > 0
      ? new Decimal((priceReverse ? priceBase.value : priceQuote.value) || 0)
          .div((priceReverse ? priceQuote.value : priceBase.value) || 1)
          .toDecimalPlaces((priceReverse ? tokenQuote.decimals : tokenBase.decimals) || 6)
          .toString()
      : '--'

  const tickPriceRef = useRef<TickData>({})
  const fullRangeTickRef = useRef<TickData>({})

  const decimals = tempCreatedPool ? Math.max(tempCreatedPool?.mintA.decimals || 0, tempCreatedPool?.mintB.decimals || 0) : 15
  const formatDecimalToDigit = useEvent(({ val }: { val: string }) =>
    new Decimal(val).toDecimalPlaces(Math.max(decimals, 8), Decimal.ROUND_FLOOR).toString()
  )

  const debouncePriceChange = useEvent(debounce(onPriceChange, 150))

  const handleLeftRangeBlur = useEvent((val: string) => {
    if (val === '') return
    if (
      !tempCreatedPool?.id ||
      new Decimal(tickPriceRef.current.priceLower || 0).toDecimalPlaces(Math.max(decimals, 8), Decimal.ROUND_FLOOR).eq(val)
    )
      return
    const r = getPriceAndTick({ pool: tempCreatedPool, price: val, baseIn })
    if (!r) return
    tickPriceRef.current.tickLower = r.tick
    tickPriceRef.current.priceLower = r.price.toFixed(20)
    setPriceRange((range) => [formatDecimalToDigit({ val: r.price.toFixed(20) }), range[1]])
    if (r.tick === tickPriceRef.current.tickUpper) {
      handleClickAdd(Side.Right, true)
    }
  })
  const handleRightRangeBlur = useEvent((val: string) => {
    if (val === '') return
    if (
      !tempCreatedPool?.id ||
      new Decimal(tickPriceRef.current.priceUpper || 0).toDecimalPlaces(Math.max(decimals, 8), Decimal.ROUND_FLOOR).eq(val)
    )
      return
    const r = getPriceAndTick({ pool: tempCreatedPool, price: val, baseIn })
    if (!r) return
    tickPriceRef.current.tickUpper = r.tick
    tickPriceRef.current.priceUpper = r.price.toString()
    setPriceRange((range) => [range[0], formatDecimalToDigit({ val: r.price.toString() })])
    if (r.tick === tickPriceRef.current.tickLower) {
      handleClickAdd(Side.Left, false)
    }
  })

  const handlePriceChange = useCallback(
    (propsVal: string) => {
      if (switchRef.current) {
        switchRef.current = false
        return
      }
      switchRef.current = false
      const val = extractNumberOnly(propsVal)
      if (val === currentPrice) {
        return
      }
      setCurrentPrice(val)
      debouncePriceChange({ price: val })
      handleLeftRangeBlur(new Decimal(val || 0).mul(0.5).toString())
      handleRightRangeBlur(new Decimal(val || 0).mul(1.5).toString())
    },
    [currentPrice, debouncePriceChange, handleLeftRangeBlur, handleRightRangeBlur]
  )

  const handleInputChange = useCallback((val: string, _: number, side?: string) => {
    setPriceRange((pos) => (side === Side.Left ? [val, pos[1]] : [pos[0], val]))
  }, [])

  const handleClickAdd = useEvent((side: string, isAdd: boolean) => {
    if (!tempCreatedPool) return
    const tickKey = side === Side.Left ? 'tickLower' : 'tickUpper'
    const tick = tickPriceRef.current[tickKey]
    const pow = (isAdd && baseIn) || (!baseIn && !isAdd) ? 0 : 1
    /* eslint-disable no-restricted-properties */
    const nextTick = tick! + tempCreatedPool.config.tickSpacing * Math.pow(-1, pow)
    const p = getTickPrice({
      pool: tempCreatedPool,
      tick: nextTick,
      baseIn
    })
    if (!p) return
    const anotherSideTick = tickPriceRef.current?.[side === Side.Left ? 'tickUpper' : 'tickLower']
    if (nextTick === anotherSideTick) return
    tickPriceRef.current[tickKey] = p.tick
    tickPriceRef.current[side === Side.Left ? 'priceLower' : 'priceUpper'] = p.price.toString()
    handleInputChange(formatDecimalToDigit({ val: p.price.toString() }), 0, side)
  })

  const computeFullRange = useEvent(() => {
    const minTick = getTickPrice({
      pool: tempCreatedPool,
      tick: parseInt((-443636 / tempCreatedPool!.config.tickSpacing).toString()) * tempCreatedPool!.config.tickSpacing,
      baseIn
    })
    const maxTick = getTickPrice({
      pool: tempCreatedPool,
      tick: parseInt((443636 / tempCreatedPool!.config.tickSpacing).toString()) * tempCreatedPool!.config.tickSpacing,
      baseIn
    })
    fullRangeTickRef.current = {
      tickLower: minTick?.tick,
      priceLower: baseIn
        ? minTick?.price.toDecimalPlaces(30, Decimal.ROUND_FLOOR).toFixed(30)
        : new Decimal(1).div(minTick?.price.toDecimalPlaces(30, Decimal.ROUND_FLOOR) || 1).toFixed(30),
      tickUpper: maxTick?.tick,
      priceUpper: baseIn
        ? maxTick?.price.toDecimalPlaces(30, Decimal.ROUND_FLOOR).toFixed(30)
        : new Decimal(1).div(maxTick?.price.toDecimalPlaces(30, Decimal.ROUND_FLOOR) || 1).toFixed(30)
    }
  })

  const handleSwitchBase = useCallback(
    (v: 'base' | 'quote') => {
      switchRef.current = true
      onSwitchBase(v === 'base')
      setTimeout(() => {
        setCurrentPrice((val) => {
          const newPrice = val ? new Decimal(1).div(val).toString() : val
          handleLeftRangeBlur(new Decimal(newPrice).mul(0.5).toString())
          handleRightRangeBlur(new Decimal(newPrice).mul(1.5).toString())
          return newPrice
        })
      }, 0)
    },
    [handleLeftRangeBlur, handleRightRangeBlur, onSwitchBase]
  )

  useEffect(() => {
    if (!isFullRange || !tempCreatedPool) return
    if (isFullRange) {
      computeFullRange()
    }
  }, [computeFullRange, tempCreatedPool, tempCreatedPool?.price, baseIn, isFullRange])

  useEffect(() => {
    if (!currentPrice) {
      setPriceRange(['', ''])
      return
    }
    if (hasInitPriceRange) return
    handleLeftRangeBlur(new Decimal(currentPrice).mul(0.5).toString())
    handleRightRangeBlur(new Decimal(currentPrice).mul(1.5).toString())
  }, [currentPrice, hasInitPriceRange, tempCreatedPool, handleLeftRangeBlur, handleRightRangeBlur])

  const handleClick = useEvent(() => {
    setPriceReverse((val) => {
      return !val
    })
    handleLeftRangeBlur(new Decimal(1).div(priceRangeRef.current[1]).toString())
    handleRightRangeBlur(new Decimal(1).div(priceRangeRef.current[0]).toString())
  })

  if (completed)
    return (
      <PanelCard px={[3, 6]} py={[3, 4]} fontSize="sm" fontWeight="500">
        <Flex alignItems="center" gap="2" justifyContent="space-between">
          <VStack align="stretch">
            <HStack color={colors.textPrimary}>
              <Text variant="label" fontSize="sm" color={colors.textSubtle}>
                {t('Initial price')}:
              </Text>
              <Text>{formatCurrency(currentPrice, { decimalPlaces: Math.max(token1.decimals, token2.decimals) })}</Text>
              <Text>
                {t('%subA% per %subB%', {
                  subA: wSolToSolString(tempCreatedPool?.[baseIn ? 'mintB' : 'mintA'].symbol),
                  subB: wSolToSolString(tempCreatedPool?.[baseIn ? 'mintA' : 'mintB'].symbol)
                })}
              </Text>
            </HStack>
            <HStack color={colors.textPrimary}>
              <Text variant="label" fontSize="sm" color={colors.textSubtle}>
                {t('Price range')}:
              </Text>
              <Text>{isFullRange ? '0 - ∞' : `${formatToRawLocaleStr(priceRange[0])} - ${formatToRawLocaleStr(priceRange[1])}`}</Text>
              <Text>
                {t('%subA% per %subB%', {
                  subA: wSolToSolString(tempCreatedPool?.[baseIn ? 'mintB' : 'mintA'].symbol),
                  subB: wSolToSolString(tempCreatedPool?.[baseIn ? 'mintA' : 'mintB'].symbol)
                })}
              </Text>
            </HStack>
          </VStack>
          <EditIcon cursor="pointer" onClick={() => onEdit(1)} />
        </Flex>
      </PanelCard>
    )

  return (
    <PanelCard p={[4, 6]}>
      <Desktop>
        <Flex mb={3} justifyContent="space-between" alignItems="center">
          <Text variant="subTitle" fontSize="xl">
            {t('Price Setting')}
          </Text>
          <Tabs
            onChange={handleSwitchBase}
            defaultValue={baseIn ? 'base' : 'quote'}
            value={baseIn ? 'base' : 'quote'}
            items={[
              {
                value: 'base',
                label: t('%subject% price', { subject: wSolToSolString(tempCreatedPool?.mintA.symbol || token1.symbol) })
              },
              {
                value: 'quote',
                label: t('%subject% price', { subject: wSolToSolString(tempCreatedPool?.mintB.symbol || token2.symbol) })
              }
            ]}
          />
        </Flex>
      </Desktop>
      <Text mb="2" variant="subTitle">
        {t('Initial price')}
      </Text>
      <DecimalInput
        decimals={decimals}
        inputGroupSx={{ alignItems: 'center', borderRadius: 'xl' }}
        inputSx={{ bg: 'transparent', pl: '4px', fontWeight: 500, fontSize: ['md', 'xl'] }}
        postfix={
          <>
            <Desktop>
              <Text variant="label" size="sm" whiteSpace="nowrap" px={4}>
                {t('%subA% per %subB%', {
                  subA: wSolToSolString(tokenBase.symbol),
                  subB: wSolToSolString(tokenQuote.symbol)
                })}
              </Text>
            </Desktop>
            <Mobile>
              <Button variant="text" onClick={() => handleSwitchBase(baseIn ? 'quote' : 'base')} scale="sm">
                <Text variant="label" size="sm" whiteSpace="nowrap" px={4}>
                  {t('%subA% per %subB%', {
                    subA: wSolToSolString(tokenBase.symbol),
                    subB: wSolToSolString(tokenQuote.symbol)
                  })}
                </Text>
              </Button>
            </Mobile>
          </>
        }
        value={currentPrice}
        onChange={handlePriceChange}
      />
      <Flex alignItems="center" gap="2" mt="2" mb={['6', '4']}>
        <Text variant="label" fontSize="sm" color={colors.textSubtle}>
          {t('Current Price')}:
        </Text>
        <QuestionToolTip
          iconProps={{ color: colors.primary60 }}
          iconType="question"
          label={t(
            'This is the current price of an existing pool on PancakeSwap. You can still enter a different initial price but be aware this may lead to arbitrage if the price difference is large.'
          )}
        />
        <Text color={colors.textSubtle} fontWeight={600} fontSize="sm" display="flex" alignItems="center" gap="1">
          {isPriceLoading ? <Skeleton width={16} height={4} /> : formatToRawLocaleStr(`${onlinePrice} `)}
          {t('%subA% per %subB%', {
            subA: wSolToSolString(priceReverse ? tokenQuote.symbol : tokenBase.symbol),
            subB: wSolToSolString(priceReverse ? tokenBase.symbol : tokenQuote.symbol)
          })}
        </Text>
        <Box border={`1px solid ${colors.secondary}`} p="1px" borderRadius="2px" width="fit-content" height="fit-content" lineHeight={0}>
          <HorizontalSwitchSmallIcon cursor="pointer" onClick={handleClick} width="10" height="10" fill={colors.secondary} />
        </Box>
      </Flex>

      <Text mb="2" variant="subTitle" userSelect="none">
        {t('Price range')}
      </Text>
      <Tabs
        mb="3"
        tabListSX={{ display: 'flex' }}
        tabItemSX={{ height: '40px' }}
        defaultValue={rangeMode}
        value={rangeMode}
        onChange={setRangeMode}
        items={[
          {
            value: 'full',
            label: t('Full Range')
          },
          {
            value: 'custom',
            label: t('Custom')
          }
        ]}
      />
      {rangeMode === 'full' ? null : (
        <SimpleGrid gridTemplate="repeat(auto-fill, 1fr)" gridAutoFlow={['row', 'column']} gap={[3, 4]} mb="4">
          <PriceRangeInputBox
            side={Side.Left}
            topLabel={t('Min')}
            currentPriceRangeValue={priceRange[0]}
            decimals={Math.max(8, decimals)}
            base={tokenBase}
            quote={tokenQuote}
            onFocus={() => handleFocus(true)}
            onAdd={() => handleClickAdd(Side.Left, true)}
            onMinus={() => handleClickAdd(Side.Left, false)}
            onInputBlur={handleLeftRangeBlur}
            onInputChange={handleInputChange}
          />
          <PriceRangeInputBox
            side={Side.Right}
            topLabel={t('Max.upper-bound')}
            currentPriceRangeValue={priceRange[1]}
            decimals={Math.max(8, decimals)}
            base={tokenBase}
            quote={tokenQuote}
            onFocus={() => handleFocus(false)}
            onAdd={() => handleClickAdd(Side.Right, true)}
            onMinus={() => handleClickAdd(Side.Right, false)}
            onInputBlur={handleRightRangeBlur}
            onInputChange={handleInputChange}
          />
        </SimpleGrid>
      )}

      <Button
        mt="3"
        disabled={!!error}
        onClick={() => {
          const dataSource = isFullRange ? fullRangeTickRef.current : tickPriceRef.current
          onConfirm({
            price: currentPrice,
            priceLower: dataSource.priceLower!,
            priceUpper: dataSource.priceUpper!,
            tickLower: dataSource.tickLower!,
            tickUpper: dataSource.tickUpper!,
            isFullRange
          })
        }}
      >
        {error || t('Continue')}
      </Button>
    </PanelCard>
  )
}
export function PriceRangeInputBox(props: {
  disabled?: boolean
  side: Side
  topLabel: string
  currentPriceRangeValue: string
  decimals: number
  base?: ApiV3Token
  quote?: ApiV3Token
  onFocus?: () => void
  onAdd: () => void
  onMinus: () => void
  onInputBlur: (val: string, side?: string | undefined) => void
  onInputChange: (val: string, valNumber: number, side?: string | undefined) => void
}) {
  const { t } = useTranslation()
  return (
    <Flex justifyContent="center" gap="1" sx={{ ...inputCard, alignItems: 'center', p: '8px' }}>
      <Minus style={IconStyle} onClick={props.onMinus} />
      <Box textAlign="center" justifyContent="center" minWidth="120px" width="fit-content">
        <Text fontWeight={600} textTransform="uppercase" whiteSpace="nowrap" variant="label" userSelect="none" color={colors.textSecondary}>
          {props.topLabel}
        </Text>
        <DecimalInput
          variant="filledDark"
          ctrSx={RangeInputStyle.ctr}
          inputSx={RangeInputStyle.input}
          inputGroupSx={RangeInputStyle.inputGroup}
          disabled={props.disabled}
          side={props.side}
          value={props.currentPriceRangeValue}
          decimals={props.decimals}
          onFocus={props.onFocus}
          onBlur={props.onInputBlur}
          onChange={props.onInputChange}
        />
        {props.base?.symbol && props.quote?.symbol ? (
          <Text variant="label" userSelect="none">
            {t('%subA% per %subB%', {
              subA: wSolToSolString(props.base.symbol),
              subB: wSolToSolString(props.quote.symbol)
            })}
          </Text>
        ) : null}
      </Box>
      <Plus style={IconStyle} cursor="pointer" onClick={props.onAdd} />
    </Flex>
  )
}
