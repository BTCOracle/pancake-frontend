import { ErrorIcon, Message, MessageText } from '@pancakeswap/uikit'
import { Box, Flex, Grid, GridItem, HStack, Tag, Text, useDisclosure } from '@chakra-ui/react'
import { ApiV3PoolInfoConcentratedItem, ApiV3Token, PoolFetchType, solToWSol } from '@pancakeswap/solana-core-sdk'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from '@pancakeswap/localization'
import BN from 'bn.js'
import Decimal from 'decimal.js'

import ConnectedButton from '@/components/ConnectedButton'
import TokenAvatarPair from '@/components/TokenAvatarPair'
import { AprKey } from '@/hooks/pool/type'
import useFetchPoolById from '@/hooks/pool/useFetchPoolById'
import useTokenPrice from '@/hooks/token/useTokenPrice'
import usePrevious from '@/hooks/usePrevious'
import { useAppStore, useClmmStore, useTokenAccountStore } from '@/store'
import { colors } from '@/theme/cssVariables'
import { formatToMaxDigit, getFirstNonZeroDecimal, formatCurrency, formatToRawLocaleStr, trimTrailZero } from '@/utils/numberish/formatter'
import toPercentString from '@/utils/numberish/toPercentString'
import IntervalCircle, { IntervalCircleHandler } from '@/components/IntervalCircle'
import { QuestionToolTip } from '@/components/QuestionToolTip'
import { Desktop } from '@/components/MobileDesktop'
import ChevronLeftIcon from '@/icons/misc/ChevronLeftIcon'
import LockIcon from '@/icons/misc/LockIcon'
import WarningIcon from '@/icons/misc/WarningIcon'
import { debounce } from '@/utils/functionMethods'
import { routeBack, useRouteQuery } from '@/utils/routeTools'
import { wSolToSol } from '@/utils/token'
import useClmmApr from '@/features/Clmm/useClmmApr'
import { useEvent } from '@/hooks/useEvent'
import { SlippageAdjuster } from '@/components/SlippageAdjuster'
import useBirdeyeTokenPrice from '@/hooks/token/useBirdeyeTokenPrice'
import useFetchRpcClmmInfo from '@/hooks/pool/clmm/useFetchRpcClmmInfo'
import { panelCard } from '@/theme/cssBlocks'
import { Side } from '@/features/Create/ClmmPool/components/SetPriceAndRange'
import {
  logGTMCreatelpCmfDepEvent,
  logGTMCreatelpSuccessEvent,
  logGTMDepositCreatePositionEvent
} from '@/utils/report/curstomGTMEventTracking'

import { calRatio } from '../utils/math'
import EstimatedAprInfo from '../components/AprInfo'
import ChartPriceLabel from '../components/ChartPriceLabel'
import LiquidityChartRangeInput from '../components/LiquidityChartRangeInput'
import PreviewDepositModal from '../components/PreviewDepositModal'
import PriceSwitchButton from '../components/PriceSwitchButton'
import RangeInput from '../components/RangeInput'
import RangePercentTabs from '../components/RangePercentTabs'
import CLMMTokenInputGroup, { InputSide } from '../components/TokenInputGroup'
import { getPriceBoundary } from '../utils/tick'
import DepositedNFTModal from './DepositedNFTModal'
import useValidate from './useValidate'

type FormatParams = Parameters<typeof formatToMaxDigit>[0]

export default function CreatePosition() {
  const isMobile = useAppStore((s) => s.isMobile)

  const { t } = useTranslation()
  const router = useRouter()
  const { pool_id: urlPoolId } = useRouteQuery<{
    pool_id?: string
  }>()
  const featureDisabled = useAppStore((s) => s.featureDisabled.createConcentratedPosition)
  const wallet = useAppStore((s) => s.wallet)

  const { isOpen, onOpen, onClose } = useDisclosure()
  const { isOpen: isNFTOpen, onOpen: onNFTOpen, onClose: onNFTClose } = useDisclosure()
  const { getPriceAndTick, computePairAmount, openPositionAct, getTickPrice } = useClmmStore()
  const getTokenBalanceUiAmount = useTokenAccountStore((s) => s.getTokenBalanceUiAmount)
  const fetchTokenAccountAct = useTokenAccountStore((s) => s.fetchTokenAccountAct)

  const [nftAddress, setNFTAddress] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [priceRange, setPriceRange] = useState(['0', '0'])
  const [tokenAmount, setTokenAmount] = useState<[string, string]>(['', ''])
  const [rangePercent, setRangePercent] = useState(0.5)
  const [aprTab, setAprTab] = useState(AprKey.Day)
  const [tokens, setTokens] = useState<{ mintA?: ApiV3Token; mintB?: ApiV3Token }>({})
  const refreshCircleRef = useRef<IntervalCircleHandler>(null)
  const fetchPoolId = urlPoolId || '2QdhepnKRTLjjSqPL1PtKNwqrUkoLee5Gqs8bvZhRdMv'

  const { data: tokenPrices } = useTokenPrice({
    mintList: [tokens.mintA?.address, tokens.mintB?.address]
  })

  const {
    formattedData,
    isLoading: isIdPoolLoading,
    mutate
  } = useFetchPoolById<ApiV3PoolInfoConcentratedItem>({
    idList: [fetchPoolId],
    type: PoolFetchType.Concentrated,
    refreshInterval: 3 * 60 * 1000
  })
  const clmmData = formattedData?.[0]
  const { data: rpcData, mutate: mutateRpcData } = useFetchRpcClmmInfo({
    id: fetchPoolId,
    refreshInterval: 30 * 1000
  })

  const preHasRpcData = usePrevious(!!rpcData)
  const hasRpcData = !!rpcData

  if (clmmData && rpcData?.currentPrice) clmmData.price = rpcData.currentPrice.toNumber()
  const currentPool = clmmData

  const { data: birdeyePrice } = useBirdeyeTokenPrice({
    mintList: [currentPool?.mintA.address, currentPool?.mintB.address]
  })

  const hasBirdPrice = !!(
    birdeyePrice &&
    birdeyePrice[currentPool?.mintA?.address || ''] &&
    birdeyePrice[currentPool?.mintB?.address || '']
  )

  const birdeyePoolPrice = hasBirdPrice
    ? new Decimal(birdeyePrice[currentPool!.mintA.address || '']?.value ?? 0).div(
        birdeyePrice[currentPool!.mintB.address || '']?.value ?? 1
      )
    : new Decimal(0)

  const tickPriceRef = useRef<{ tickLower?: number; tickUpper?: number; priceLower?: string; priceUpper?: string; liquidity?: BN }>({})
  const tokenAmountRef = useRef<[string, string]>(['', ''])
  const computeRef = useRef(false)
  const focusPoolARef = useRef<boolean>(true)
  const initialPriceRef = useRef<{ priceLower: string; priceUpper: string }>({ priceLower: '', priceUpper: '' })
  const baseIn = !tokens.mintA || tokens.mintA.address === currentPool?.mintA?.address
  const poolId = currentPool?.id
  const prePoolId = usePrevious(`${poolId}-${baseIn}`)
  const poolMintAStr = currentPool?.mintA?.address
  const decimals = Math.max(currentPool?.mintA?.decimals || 0, currentPool?.mintB?.decimals || 0, 6)
  const isLowLiquidity = clmmData && clmmData.tvl < 10000
  const poolPriceDiff =
    hasBirdPrice && rpcData
      ? rpcData.currentPrice.sub(birdeyePoolPrice).abs().div(birdeyePoolPrice).mul(100).clamp(0, 99).toDecimalPlaces(2).toNumber()
      : 0
  const priceWarn = poolPriceDiff > 1

  const currentPriceStr = baseIn
    ? currentPool?.price.toFixed(decimals) || ''
    : (currentPool ? 1 / currentPool.price : 0).toFixed(decimals) || ''

  const disabledInput = currentPool
    ? [new Decimal(currentPriceStr || 0).gte(priceRange[1] || 0), new Decimal(currentPriceStr || 0).lte(priceRange[0] || 0)]
    : [false, false]

  const priceA = tokens.mintA ? tokenPrices[tokens.mintA.address]?.value : undefined
  const priceB = tokens.mintB ? tokenPrices[tokens.mintB.address]?.value : undefined
  const validPriceA = priceA !== undefined && priceA >= 0 ? priceA : 0
  const validPriceB = priceB !== undefined && priceB >= 0 ? priceB : 0
  const totalMintAValue = new Decimal(tokenAmount[0] || '0').mul(validPriceA)
  const totalMintBValue = new Decimal(tokenAmount[1] || '0').mul(validPriceB)
  const totalPrice = totalMintAValue.add(totalMintBValue)

  const { ratioA, ratioB } = calRatio({
    price: currentPriceStr,
    amountA: tokenAmount[0],
    amountB: tokenAmount[1]
  })

  const aprData = useClmmApr({
    poolInfo: currentPool,
    poolLiquidity: rpcData?.liquidity || new BN(0),
    positionInfo: tickPriceRef.current,
    timeBasis: aprTab
  })

  const debounceCompute = useCallback(
    debounce((props: Parameters<typeof computePairAmount>[0]) => {
      computePairAmount(props).then((res) => {
        computeRef.current = !!res
        if (res) {
          tickPriceRef.current.liquidity = res.liquidity
          setTokenAmount((preValue) => {
            if (baseIn)
              return focusPoolARef.current
                ? [preValue[0], props.amount ? trimTrailZero(res.amountSlippageB.toFixed(clmmData?.mintB.decimals))! : '']
                : [props.amount ? trimTrailZero(res.amountSlippageA.toFixed(clmmData?.mintA.decimals))! : '', preValue[1]]
            return focusPoolARef.current
              ? [props.amount ? trimTrailZero(res.amountSlippageB.toFixed(clmmData?.mintB.decimals))! : '', preValue[1]]
              : [preValue[0], props.amount ? trimTrailZero(res.amountSlippageA.toFixed(clmmData?.mintA.decimals))! : '']
          })
        }
      })
    }, 150),
    [baseIn, clmmData?.mintA.decimals, clmmData?.mintB.decimals]
  )

  const error = useValidate({
    poolId,
    priceRange,
    tokenAmount,
    balanceA: getTokenBalanceUiAmount({
      mint: wSolToSol(tokens.mintA?.address) || '',
      decimals: tokens.mintA?.decimals
    }).text,
    balanceB: getTokenBalanceUiAmount({
      mint: wSolToSol(tokens.mintB?.address) || '',
      decimals: tokens.mintB?.decimals
    }).text
  })

  const formatDecimalToDigit = useCallback(
    (params: FormatParams) => {
      if (!params.val) return ''
      const maxLength = getFirstNonZeroDecimal(String(params.val)) + 5
      return new Decimal(params.val).toDecimalPlaces(Math.max(decimals, 15, maxLength)).toFixed(Math.max(decimals, 15, maxLength))
    },
    [decimals]
  )

  useEffect(() => {
    if (!poolId) return
    setRangePercent(currentPool.config.defaultRange)
  }, [poolId, baseIn, currentPool?.config.defaultRange])

  useEffect(() => {
    // initialize pool tick
    if (!currentPool) {
      !isIdPoolLoading && setTokenAmount(['', ''])
      return
    }
    if (prePoolId === `${poolId}-${baseIn}` && hasRpcData === preHasRpcData) return
    const res = getPriceBoundary({
      poolInfo: currentPool,
      baseIn
    })
    if (res) {
      initialPriceRef.current = {
        priceLower: res.priceLower.toString(),
        priceUpper: res.priceUpper.toString()
      }
      setPriceRange([formatDecimalToDigit({ val: res.priceLower.toFixed(20) }), formatDecimalToDigit({ val: res.priceUpper.toFixed(20) })])
      tickPriceRef.current = {
        tickLower: res.priceLowerTick,
        tickUpper: res.priceUpperTick,
        priceLower: res.priceLower.toString(),
        priceUpper: res.priceUpper.toString()
      }
    }
  }, [currentPool, isIdPoolLoading, prePoolId, poolId, baseIn, formatDecimalToDigit, preHasRpcData, hasRpcData])

  useEffect(() => {
    if (!poolId) return
    if (computeRef.current) {
      computeRef.current = false
      return
    }
    const amount = (focusPoolARef.current && baseIn) || (!focusPoolARef.current && !baseIn) ? tokenAmount[0] : tokenAmount[1]

    debounceCompute({
      ...tickPriceRef.current,
      pool: currentPool,
      inputA: focusPoolARef.current,
      amount
    })
  }, [poolId, currentPool, baseIn, tokenAmount, priceRange, debounceCompute, rpcData?.currentPrice])

  const handleAmountChange = useCallback(
    (val: string, side: string) => {
      if (isIdPoolLoading) return
      setTokenAmount((preValue) => (side === InputSide.TokenA ? [val, preValue[1]] : [preValue[0], val]))
    },
    [isIdPoolLoading]
  )
  const handleLeftRangeBlur = useEvent((val: string, skip?: boolean) => {
    if (val === '' || skip) return
    const decimal = new Decimal(val).decimalPlaces()
    if (new Decimal(tickPriceRef.current.priceLower || 0).toFixed(decimal, Decimal.ROUND_DOWN) === val) return
    const r = getPriceAndTick({ pool: currentPool, price: val, baseIn })

    if (!r) return
    tickPriceRef.current.tickLower = r.tick
    tickPriceRef.current.priceLower = r.price.toString()
    setPriceRange((range) => [formatDecimalToDigit({ val: r.price.toFixed(20) }), range[1]])
    if (r.tick === tickPriceRef.current.tickUpper) {
      handleClickAdd(Side.Right, true)
    }
    setRangePercent(0)
  })

  const handleRightRangeBlur = useEvent((val: string, skip?: boolean) => {
    if (val === '' || skip) return
    if (new Decimal(tickPriceRef.current.priceUpper || 0).toDecimalPlaces(new Decimal(val).decimalPlaces()).eq(val)) return
    const r = getPriceAndTick({ pool: currentPool, price: val, baseIn })
    if (!r) return
    tickPriceRef.current.tickUpper = r.tick
    tickPriceRef.current.priceUpper = r.price.toString()
    setPriceRange((range) => [range[0], formatDecimalToDigit({ val: r.price.toFixed(20) })])
    if (r.tick === tickPriceRef.current.tickLower) {
      handleClickAdd(Side.Left, false)
    }
    setRangePercent(0)
  })

  const handleInputChange = useCallback((val: string, _: number, side?: string) => {
    setPriceRange((pos) => (side === Side.Left ? [val, pos[1]] : [pos[0], val]))
  }, [])

  const handleFocusChange = useCallback(
    (tokenMint?: string) => {
      focusPoolARef.current = solToWSol(tokenMint || '').toBase58() === solToWSol(poolMintAStr || '').toBase58()
    },
    [poolMintAStr]
  )

  const handleClickPercent = useCallback(
    (val: number) => {
      if (!currentPool) return
      const price = baseIn ? currentPool.price : new Decimal(1).div(currentPool.price || 1)
      const [minPrice, maxPrice] =
        val > 0
          ? [new Decimal(price).mul(1 - val).toString(), new Decimal(price).mul(1 + val).toString()]
          : [initialPriceRef.current.priceLower, initialPriceRef.current.priceUpper]
      const minRes = getPriceAndTick({ pool: currentPool, price: minPrice, baseIn })
      const maxRes = getPriceAndTick({ pool: currentPool, price: maxPrice, baseIn })

      if (minRes) {
        tickPriceRef.current.tickLower = minRes.tick
        tickPriceRef.current.priceLower = minRes.price.toFixed(20)
      }
      if (maxRes) {
        tickPriceRef.current.tickUpper = maxRes.tick
        tickPriceRef.current.priceUpper = maxRes.price.toFixed(20)
      }
      setPriceRange((range) => [
        minRes ? formatDecimalToDigit({ val: minRes.price.toFixed(20) }) : range[0],
        maxRes ? formatDecimalToDigit({ val: maxRes.price.toFixed(20) }) : range[1]
      ])
      setRangePercent(val)
      if (val === 0) setRangePercent(currentPool.config.defaultRange)
    },
    [getPriceAndTick, formatDecimalToDigit, currentPool, baseIn]
  )

  const handleClickSwitch = useCallback(
    () =>
      setTokens((val) => ({
        mintA: val.mintB,
        mintB: val.mintA
      })),
    []
  )

  const handleClickAdd = useEvent((side: string, isAdd: boolean) => {
    if (!currentPool) return
    const tickKey = side === Side.Left ? 'tickLower' : 'tickUpper'
    const tick = tickPriceRef.current[tickKey]
    const pow = (isAdd && baseIn) || (!baseIn && !isAdd) ? 0 : 1
    // eslint-disable-next-line no-restricted-properties
    const nextTick = tick! + currentPool.config.tickSpacing * Math.pow(-1, pow)
    const p = getTickPrice({
      pool: currentPool,
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

  useEffect(() => {
    if (!currentPool) return
    setTokens({
      mintA: currentPool.mintA,
      mintB: currentPool.mintB
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPool?.id])

  useEffect(() => {
    if (urlPoolId !== poolId && poolId) {
      router.replace(router.pathname, { query: { pool_id: poolId } })
    }
  }, [urlPoolId, poolId, router])

  const [priceMin, priceMax] = useMemo(() => {
    if (!currentPool) return [0, 0]
    if (baseIn) return [currentPool?.[aprTab].priceMin, currentPool?.[aprTab].priceMax]
    return [
      currentPool?.[aprTab].priceMax ? 1 / currentPool?.[aprTab].priceMax : currentPool?.[aprTab].priceMax,
      currentPool?.[aprTab].priceMin ? 1 / currentPool?.[aprTab].priceMin : currentPool?.[aprTab].priceMin
    ]
  }, [baseIn, currentPool, aprTab])

  const handleClickRefresh = useEvent(() => {
    refreshCircleRef.current?.restart()
    fetchTokenAccountAct({})
    mutate()
    mutateRpcData()
  })

  const createPosition = () => {
    logGTMCreatelpCmfDepEvent('V3', false)
    setIsSending(true)
    const [mintAAmount, mintBAmount] = [
      new Decimal(tokenAmountRef.current[baseIn ? 0 : 1]).mul(10 ** (currentPool?.mintA.decimals ?? 0)).toFixed(0),
      new Decimal(tokenAmountRef.current[baseIn ? 1 : 0]).mul(10 ** (currentPool?.mintB.decimals ?? 0)).toFixed(0)
    ]
    openPositionAct({
      t,
      poolInfo: currentPool!,
      base: focusPoolARef.current ? 'MintA' : 'MintB',
      baseAmount: focusPoolARef.current ? mintAAmount : mintBAmount,
      otherAmountMax: focusPoolARef.current ? mintBAmount : mintAAmount,
      tickLower: tickPriceRef.current.tickLower!,
      tickUpper: tickPriceRef.current.tickUpper!,
      onConfirmed: () => {
        logGTMCreatelpSuccessEvent({
          version: 'V3',
          isCreate: false,
          token0: currentPool?.mintA.address ?? '',
          token1: currentPool?.mintB.address ?? '',
          token0Amt: mintAAmount,
          token1Amt: mintBAmount,
          feeTier: toPercentString((currentPool?.feeRate ?? 0) * 100),
          walletAddress: wallet?.adapter.publicKey?.toString() ?? ''
        })
        onClose()
        onNFTOpen()
        setIsSending(false)
        setTimeout(() => {
          mutate()
        }, 500)
      },
      onCloseToast: () => setIsSending(false),
      onError: () => setIsSending(false)
    }).then((props) => {
      setNFTAddress(props?.buildData?.extInfo.nftMint.toString() || '')
    })
  }

  const hasLockedLiquidity = currentPool && (currentPool?.burnPercent ?? 0) > 0

  return (
    <Grid
      gridTemplate={[
        `
        "back        " auto
        "chip        " auto
        "chart-panel " auto
        "inputs      " auto /  1fr
    `,
        `
        "back        back  " auto
        "chip        chip  " auto
        "chart-panel inputs" auto / 1.5fr 1fr
      `
      ]}
      gap={[2, 4]}
      pb={[4, 6]}
    >
      <GridItem area="back">
        <Flex>
          <HStack cursor="pointer" onClick={routeBack} color={colors.primary60} fontWeight="400" fontSize="md">
            <ChevronLeftIcon color={colors.textTertiary} />
            <Text>{t('Back')}</Text>
          </HStack>
        </Flex>
      </GridItem>

      <GridItem area="chip">
        <Box>
          <HStack rounded="xl" color={colors.textPrimary} justifyContent="space-between" py={[0, 4]} gap={[3, 4]}>
            <Flex
              direction={['column', 'row']}
              flex={1}
              gap="2"
              fontSize="16px"
              fontWeight="600"
              {...(isMobile
                ? {
                    ...panelCard,
                    px: 4,
                    py: 6
                  }
                : {})}
            >
              <Flex gap="2" alignItems="center">
                <TokenAvatarPair size="smi" token1={currentPool?.mintA} token2={currentPool?.mintB} />
                {currentPool?.poolName.replace('-', ' / ')}
                <Tag size="sm" variant="rounded">
                  {formatToRawLocaleStr(toPercentString((currentPool?.feeRate || 0) * 100))}
                </Tag>
              </Flex>
              {hasLockedLiquidity && (
                <Flex alignItems="center" gap={1}>
                  <LockIcon />
                  <Text opacity={0.6} fontSize="xs" color={colors.textSubtle}>
                    {t('%percent% permanently locked', {
                      percent: formatToRawLocaleStr(toPercentString(currentPool.burnPercent || 0, { alreadyPercented: true }))
                    })}
                  </Text>
                </Flex>
              )}
            </Flex>

            <Desktop>
              <Flex gap="24px" justifyContent="space-between" whiteSpace="nowrap">
                {[
                  { label: t('TVL'), value: currentPool?.tvl },
                  { label: t('Volume 24H'), value: currentPool?.day.volume },
                  { label: t('Fees 24H'), value: currentPool?.day.volumeFee }
                ].map(({ label, value }) => (
                  <Flex gap="2" alignItems="center">
                    <Text color={colors.textSubtle}>{label}</Text>
                    <Text color={colors.textPrimary}>{formatCurrency(value, { symbol: '$', decimalPlaces: 2 })}</Text>
                  </Flex>
                ))}
              </Flex>
            </Desktop>
          </HStack>
        </Box>
      </GridItem>

      <GridItem area="chart-panel">
        <Grid
          gridTemplate={[
            `
          "section-title  switch-btn   " auto
          "chart-window   chart-window " auto
          "range-input    range-input  " auto
          "tabs           tabs         " auto
          "apr            apr          " auto / 3fr 1fr
        `,
            `
          "section-title  section-title" auto
          "chart-window   chart-window " auto
          "range-input    range-input  " auto
          "tabs           switch-btn   " auto
          "apr            apr          " auto / 3fr 1fr
        `
          ]}
          rounded="xl"
          p={[3, '20px']}
          gap={[4, 4]}
          alignItems="center"
          {...panelCard}
        >
          <GridItem gridArea="section-title">
            <Text variant="title">{t('Set Price Range')}</Text>
          </GridItem>
          <GridItem gridArea="chart-window">
            <Grid
              gridTemplate={[
                `
            "info " auto
            "chart" auto / 1fr
            `,
                `
            "chart  info" auto / 2fr 1fr
            `
              ]}
              p={[2, 4]}
              pt={12}
              borderRadius="xl"
              gap="10"
              position="relative"
              {...panelCard}
              bg={colors.cardSecondary}
            >
              <GridItem gridArea="chart">
                <LiquidityChartRangeInput
                  poolId={poolId!}
                  feeAmount={currentPool ? currentPool.feeRate * 1000000 : undefined}
                  ticksAtLimit={{}}
                  price={parseFloat(currentPriceStr)}
                  priceLower={priceRange[0]}
                  priceUpper={priceRange[1]}
                  timePriceMin={priceMin}
                  timePriceMax={priceMax}
                  onLeftRangeInput={handleLeftRangeBlur}
                  onRightRangeInput={handleRightRangeBlur}
                  interactive
                  baseIn={baseIn}
                  autoZoom
                  outOfRange={disabledInput[0] || disabledInput[1]}
                  containerStyle={{ flex: 2.5 }}
                  zoomBlockStyle={{ position: 'absolute', right: isMobile ? '10px' : '16px', top: isMobile ? '10px' : '16px' }}
                  defaultRange={currentPool?.config.defaultRange}
                />
              </GridItem>
              <GridItem gridArea="info" placeSelf="center">
                <ChartPriceLabel
                  currentPrice={formatCurrency(currentPriceStr, { decimalPlaces: currentPool?.poolDecimals }) || ''}
                  currentPriceLabel={t('%subA% per %subB%', {
                    subA: currentPool?.[baseIn ? 'mintB' : 'mintA'].symbol,
                    subB: currentPool?.[baseIn ? 'mintA' : 'mintB'].symbol
                  })}
                  timePrice={`${formatCurrency(priceMin < 0 ? currentPriceStr : priceMin, {
                    decimalPlaces: currentPool?.poolDecimals
                  })} - ${formatCurrency(priceMax < 0 ? currentPriceStr : priceMax, {
                    decimalPlaces: currentPool?.poolDecimals
                  })}`}
                  timeBase={aprTab}
                />
              </GridItem>
            </Grid>
          </GridItem>
          <GridItem gridArea="range-input">
            <RangeInput
              priceRange={priceRange}
              decimals={Math.max(decimals, 15)}
              onInputChange={handleInputChange}
              onLeftBlur={handleLeftRangeBlur}
              onRightBlur={handleRightRangeBlur}
              onClickAdd={handleClickAdd}
              tokenBase={baseIn ? currentPool?.mintB : currentPool?.mintA}
              tokenQuote={baseIn ? currentPool?.mintA : currentPool?.mintB}
            />
          </GridItem>

          <GridItem gridArea="tabs">
            <RangePercentTabs options={currentPool?.config.defaultRangePoint} selected={rangePercent} onClick={handleClickPercent} />
          </GridItem>

          <GridItem gridArea="switch-btn" justifySelf="end">
            <PriceSwitchButton priceLabel={currentPool?.[baseIn ? 'mintB' : 'mintA'].symbol || '-'} onClickSwitch={handleClickSwitch} />
          </GridItem>

          <GridItem gridArea="apr">
            <EstimatedAprInfo onChange={(val: AprKey) => setAprTab(val)} value={aprTab} aprData={aprData} />
          </GridItem>
        </Grid>
      </GridItem>

      <GridItem area="inputs">
        <Flex rounded="xl" p={[3, '20px']} gap={[2, 4]} {...panelCard} w="full" flexDirection="column" justifyContent="space-between">
          <Flex alignItems="center" justifyContent="space-between" mb="3">
            <Text variant="title">{t('Add Deposit Amount')}</Text>
            <Flex align="center" gap={3}>
              <SlippageAdjuster variant="liquidity" />
              <IntervalCircle
                svgWidth={18}
                strokeWidth={3}
                trackStrokeColor={colors.textSecondary}
                trackStrokeOpacity={0.5}
                filledTrackStrokeColor={colors.textSecondary}
                componentRef={refreshCircleRef}
                duration={60 * 1000}
                onClick={handleClickRefresh}
                onEnd={handleClickRefresh}
              />
            </Flex>
          </Flex>
          <CLMMTokenInputGroup
            disableSelectToken
            pool={currentPool}
            baseIn={baseIn}
            readonly={!currentPool || featureDisabled}
            tokenAmount={tokenAmount}
            onFocusChange={handleFocusChange}
            onAmountChange={handleAmountChange}
            token1Disable={disabledInput[0]}
            token2Disable={disabledInput[1]}
            maxMultiplier={0.985}
          />
          <Box>
            <HStack justifyContent="space-between">
              <Text fontSize="sm" color={colors.textSubtle}>
                {t('Total Deposit')}
              </Text>
              <Text fontSize="sm">
                {tokenAmount[0] && tokenAmount[1] ? formatCurrency(totalPrice.toString(), { symbol: '$', decimalPlaces: 2 }) : '--'}
              </Text>
            </HStack>
            <HStack justifyContent="space-between" mt={1.5}>
              <Text fontSize="sm" color={colors.textSubtle}>
                {t('Deposit Ratio')}
              </Text>
              <Flex alignItems="center" gap="2" fontSize="sm" color={colors.positive60}>
                <Text>
                  {formatToRawLocaleStr(
                    toPercentString(ratioA, {
                      decimals: 1
                    })
                  )}{' '}
                  /{' '}
                  {formatToRawLocaleStr(
                    toPercentString(ratioB, {
                      decimals: 1
                    })
                  )}
                </Text>
                <TokenAvatarPair size="sm" token1={currentPool?.mintA} token2={currentPool?.mintB} />
              </Flex>
            </HStack>
            {priceWarn ? (
              <HStack fontSize="xs" color={poolPriceDiff > 5 ? colors.textPink : colors.text01} gap={1} mt={2}>
                <Text pb={0.5}>
                  <WarningIcon stroke={poolPriceDiff > 5 ? colors.textPink : colors.text01} />
                </Text>
                <Text>
                  {t('Pool price is %percent% away from market', {
                    percent: `${poolPriceDiff}%`
                  })}
                </Text>
                <QuestionToolTip
                  label={
                    <Text>
                      {t(
                        'The pool price is imbalanced for this pair. Adding a small amount of liquidity in a wide range can bring the price closer to the current market price.'
                      )}
                    </Text>
                  }
                  iconProps={{ color: poolPriceDiff > 5 ? colors.textPink : colors.text01 }}
                />
              </HStack>
            ) : null}
          </Box>
          {isLowLiquidity ? (
            <Message variant="warning" icon={<ErrorIcon color={colors.warning50} />} style={{ borderColor: colors.warning20 }}>
              <MessageText>
                <Text
                  color={colors.textPrimary}
                  fontWeight="bold"
                  fontSize="xs"
                  pl={1.5}
                  textOverflow="ellipsis"
                  whiteSpace="pre-wrap"
                  overflow="hidden"
                >
                  {t('Low Liquidity: ')}
                  <Text fontWeight="normal" as="span">
                    {t(
                      'Your deposit is large relative to current liquidity in the pool, which may lead to arbitrage on your position. If the quoted price is far from market price, this risk may be magnified.'
                    )}
                  </Text>
                </Text>
              </MessageText>
            </Message>
          ) : null}
          <ConnectedButton
            width="100%"
            my="1rem"
            disabled={featureDisabled || isIdPoolLoading || !!error}
            onClick={() => {
              logGTMDepositCreatePositionEvent()
              tokenAmountRef.current = [...tokenAmount]
              onOpen()
            }}
          >
            {featureDisabled ? t('Disabled') : isIdPoolLoading ? t('Loading pool') : error || t('Add Liquidity')}
          </ConnectedButton>
        </Flex>
      </GridItem>

      {currentPool && isOpen ? (
        <PreviewDepositModal
          isSending={isSending}
          isOpen={isOpen}
          pool={currentPool}
          baseIn={baseIn}
          onConfirm={createPosition}
          onClose={onClose}
          tokenPrices={tokenPrices}
          tokenAmount={baseIn ? tokenAmountRef.current : [tokenAmountRef.current[1], tokenAmountRef.current[0]]}
          priceRange={[tickPriceRef.current.priceLower!, tickPriceRef.current.priceUpper!]}
        />
      ) : null}
      <DepositedNFTModal nftAddress={nftAddress} isOpen={isNFTOpen} onClose={onNFTClose} />
    </Grid>
  )
}
