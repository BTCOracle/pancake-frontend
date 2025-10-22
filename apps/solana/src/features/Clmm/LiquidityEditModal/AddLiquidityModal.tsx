import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from '@pancakeswap/localization'
import { FlexGap, ModalV2, MotionModal, useMatchBreakpoints } from '@pancakeswap/uikit'
import { Box, Badge, Collapse, Flex, Text, HStack } from '@chakra-ui/react'
import { solToWSol } from '@pancakeswap/solana-core-sdk'
import { shallow } from 'zustand/shallow'

import Decimal from 'decimal.js'
import BN from 'bn.js'
import { FormattedPoolInfoConcentratedItem } from '@/hooks/pool/type'
import TokenAvatarPair from '@/components/TokenAvatarPair'
import { debounce } from '@/utils/functionMethods'
import { formatCurrency } from '@/utils/numberish/formatter'
import useClmmBalance, { ClmmPosition } from '@/hooks/portfolio/clmm/useClmmBalance'
import { useAppStore, useClmmStore, useTokenAccountStore } from '@/store'
import { colors } from '@/theme/cssVariables'
import Button from '@/components/Button'
import { wSolToSol } from '@/utils/token'
import TokenAvatar from '@/components/TokenAvatar'
import toPercentString from '@/utils/numberish/toPercentString'
import { Desktop, Mobile } from '@/components/MobileDesktop'
import useTokenPrice from '@/hooks/token/useTokenPrice'
import { useEvent } from '@/hooks/useEvent'
import IntervalCircle, { IntervalCircleHandler } from '@/components/IntervalCircle'
import { SlippageAdjuster } from '@/components/SlippageAdjuster'
import { SlippageSettingField } from '@/components/SlippageAdjuster/SlippageSettingField'
import { useDisclosure } from '@/hooks/useDelayDisclosure'
import { panelCard } from '@/theme/cssBlocks'
import {
  logGTMPoolLiquidityAddCmfEvent,
  logGTMPoolLiquidityAddSuccessEvent,
  logGTMSolErrorLogEvent
} from '@/utils/report/curstomGTMEventTracking'
import { calRatio } from '../utils/math'
import CLMMTokenInputGroup, { InputSide } from '../components/TokenInputGroup'
import { liquidityValidateSchema } from './validateSchema'

export default function AddLiquidityModal({
  isOpen,
  baseIn,
  onClose,
  onSyncSending,
  onRefresh,
  poolInfo,
  position
}: {
  isOpen: boolean
  baseIn: boolean
  onClose: () => void
  onRefresh?: () => void
  onSyncSending: (val: boolean) => void
  poolInfo: FormattedPoolInfoConcentratedItem
  position: ClmmPosition
}) {
  const { t } = useTranslation()
  const { isMobile } = useMatchBreakpoints()
  const featureDisabled = useAppStore((s) => s.featureDisabled.addConcentratedPosition)
  const wallet = useAppStore((s) => s.wallet)
  const getTokenBalanceUiAmount = useTokenAccountStore((s) => s.getTokenBalanceUiAmount)
  const { getPriceAndAmount } = useClmmBalance({})
  const { priceLower, priceUpper, amountA, amountB } = getPriceAndAmount({ poolInfo, position })

  const circleRef = useRef<IntervalCircleHandler>(null)
  const { isOpen: isSlippageOpen, onToggle: onToggleSlippage, onClose: onSlippageClose } = useDisclosure()

  const handleClick = useEvent(() => {
    circleRef.current?.restart()
    onRefresh?.()
  })

  const handleCloseModal = useEvent(() => {
    onClose()
    onSlippageClose()
  })

  const currentPrice = baseIn ? new Decimal(poolInfo.price) : new Decimal(1).div(poolInfo.price)
  const [priceLowerDecimal, priceUpperDecimal] = baseIn
    ? [priceLower.price, priceUpper.price]
    : [new Decimal(1).div(priceUpper.price), new Decimal(1).div(priceLower.price)]

  const inRange = new Decimal(currentPrice).gte(priceLowerDecimal) && new Decimal(currentPrice).lte(priceUpperDecimal)
  const [sending, setIsSending] = useState(false)

  const [computePairAmount, increaseLiquidityAct] = useClmmStore((s) => [s.computePairAmount, s.increaseLiquidityAct], shallow)
  const [tokenAmount, setTokenAmount] = useState(['', ''])

  const computeRef = useRef(false)
  const focusPoolARef = useRef(true)
  const tickPriceRef = useRef<{ tickLower?: number; tickUpper?: number; priceLower?: string; priceUpper?: string; liquidity?: BN }>({
    tickLower: priceLower.tick,
    tickUpper: priceUpper.tick,
    priceLower: priceLowerDecimal.toString(),
    priceUpper: priceUpperDecimal.toString()
  })

  const disabledInput = inRange
    ? [false, false]
    : [new Decimal(poolInfo.price).gt(priceUpper.price), new Decimal(poolInfo.price).lt(priceLower.price)]

  const handleAmountChange = useCallback((val: string, side: string) => {
    setTokenAmount((preValue) => (side === InputSide.TokenA ? [val, preValue[1]] : [preValue[0], val]))
  }, [])

  const { data: tokenPrices } = useTokenPrice({
    mintList: [poolInfo.mintA.address, poolInfo.mintB.address]
  })

  const positionTotalVolume = amountA
    .mul(tokenPrices[poolInfo.mintA.address]?.value || 0)
    .add(amountB.mul(tokenPrices[poolInfo.mintB.address]?.value || 0))

  const mintAVolume = new Decimal(tokenPrices[poolInfo.mintA.address!]?.value || 0).mul(tokenAmount[0] || 0)
  const mintBVolume = new Decimal(tokenPrices[poolInfo.mintB.address!]?.value || 0).mul(tokenAmount[1] || 0)
  const totalDeposited = mintAVolume.add(mintBVolume)

  const { ratioA, ratioB } = calRatio({
    price: poolInfo.price,
    amountA: tokenAmount[0],
    amountB: tokenAmount[1]
  })

  let error
  try {
    liquidityValidateSchema(t).validateSync({
      tokenAmount,
      balanceA: getTokenBalanceUiAmount({ mint: wSolToSol(poolInfo.mintA.address)!, decimals: poolInfo.mintA.decimals }).text,
      balanceB: getTokenBalanceUiAmount({ mint: wSolToSol(poolInfo.mintB.address)!, decimals: poolInfo.mintB.decimals }).text
    })

    error = undefined
  } catch (e: any) {
    error = e.message as string
  }

  const debounceCompute = useCallback(
    debounce((props: Parameters<typeof computePairAmount>[0]) => {
      computePairAmount(props).then((res) => {
        computeRef.current = !!res
        if (res) {
          tickPriceRef.current.liquidity = res.liquidity
          setTokenAmount((preValue) => {
            return focusPoolARef.current
              ? [preValue[0], props.amount ? res.amountSlippageB.toString() : '']
              : [props.amount ? res.amountSlippageA.toString() : '', preValue[1]]
          })
        }
      })
    }, 100),
    [baseIn]
  )

  const handleFocusChange = useCallback(
    (tokenMint?: string) => {
      focusPoolARef.current = solToWSol(tokenMint || '').toBase58() === solToWSol(poolInfo.mintA.address || '').toBase58()
    },
    [poolInfo.mintA.address]
  )

  useEffect(() => {
    if (computeRef.current) {
      computeRef.current = false
      return
    }
    const amount = focusPoolARef.current ? tokenAmount[0] : tokenAmount[1]

    debounceCompute({
      ...tickPriceRef.current,
      pool: poolInfo,
      inputA: focusPoolARef.current,
      amount
    })
  }, [poolInfo, tokenAmount, debounceCompute])

  useEffect(() => {
    setTokenAmount(['', ''])
    setIsSending(false)
  }, [isOpen])

  useEffect(() => {
    onSyncSending(sending)
    return () => onSyncSending(false)
  }, [sending, onSyncSending])

  return (
    <ModalV2 isOpen={isOpen} onDismiss={handleCloseModal}>
      <MotionModal
        title={
          <FlexGap alignItems="center" gap="10px">
            <Text>{t('Add Liquidity to')}</Text>
            <TokenAvatarPair size={['smi', 'md']} token1={poolInfo.mintA} token2={poolInfo.mintB} />
            <Desktop>
              <Text>{poolInfo.poolName}</Text>
            </Desktop>
          </FlexGap>
        }
        minWidth={[null, null, null, '512px']}
        maxWidth={['100%', '100%', '100%', '512px']}
        minHeight={isMobile ? '500px' : undefined}
        headerPadding="12px 16px 12px 16px"
      >
        <div style={{ flex: 1 }}>
          <Text variant="subTitle" color={colors.textPrimary}>
            {t('Current position')}
          </Text>
          <Box rounded="xl" px={[3, 4]} py={[3, 3]} mt="4" mb="5" {...panelCard}>
            <Flex alignItems="center">
              <Text fontSize={['md', 'xl']} fontWeight="600">
                {formatCurrency(priceLowerDecimal.toString(), {
                  decimalPlaces: poolInfo.recommendDecimal(priceLowerDecimal)
                })}{' '}
                -{' '}
                {formatCurrency(priceUpperDecimal.toString(), {
                  decimalPlaces: poolInfo.recommendDecimal(priceUpperDecimal)
                })}
              </Text>
              <Badge ml="4" variant={inRange ? 'ok' : 'error'}>
                {inRange ? t('In Range') : t('Out of Range')}
              </Badge>
            </Flex>
            <Text variant="label">
              {t('%subA% per %subB%', {
                subA: poolInfo[baseIn ? 'mintB' : 'mintA'].symbol,
                subB: poolInfo[baseIn ? 'mintA' : 'mintB'].symbol
              })}
            </Text>
            <Flex gap="4" mt="2" justify="space-between">
              <Box>
                <Text color={colors.textPrimary} fontSize="sm">
                  {t('Liquidity')}
                </Text>
                <Text fontSize={['md', 'xl']} fontWeight="600">
                  {formatCurrency(positionTotalVolume.toString(), { symbol: '$', decimalPlaces: 2 })}
                </Text>
              </Box>

              <Box>
                <Text color={colors.textPrimary} fontSize="sm">
                  {t('Current Price')}
                </Text>
                <Text fontSize={['md', 'xl']} fontWeight="600">
                  {formatCurrency(currentPrice.toString(), { symbol: '$', maximumDecimalTrailingZeroes: 5 })}
                </Text>
              </Box>

              <Box>
                <Text color={colors.textPrimary} fontSize="sm">
                  {t('Deposit Ratio')}
                </Text>
                <HStack fontSize={['md', 'xl']} fontWeight="600">
                  <Desktop>
                    <TokenAvatar token={poolInfo.mintA} size="sm" />
                    <Text>{toPercentString(ratioA)}</Text>
                    <Text>/</Text>
                    <TokenAvatar token={poolInfo.mintB} size="sm" />
                    <Text>{toPercentString(ratioB)}</Text>
                  </Desktop>
                  <Mobile>
                    <HStack flexWrap="nowrap" gap="1">
                      <HStack gap="1">
                        <TokenAvatar token={poolInfo.mintA} size="sm" />
                        <Text>{toPercentString(ratioA)}</Text>
                      </HStack>
                      <Text>/</Text>
                      <HStack gap="1">
                        <TokenAvatar token={poolInfo.mintB} size="sm" />
                        <Text>{toPercentString(ratioB)}</Text>
                      </HStack>
                    </HStack>
                  </Mobile>
                </HStack>
              </Box>
            </Flex>
          </Box>

          <HStack mb="2" gap={2} justifyContent="space-between" alignItems="center" flexWrap="wrap">
            <Text variant="subTitle" color={colors.textPrimary}>
              {t('Add Liquidity')}
            </Text>
            <Flex align="center" gap={3}>
              <SlippageAdjuster variant="liquidity" onClick={onToggleSlippage} />
              <IntervalCircle
                componentRef={circleRef}
                svgWidth={18}
                strokeWidth={2}
                trackStrokeColor={colors.secondary}
                trackStrokeOpacity={0.5}
                filledTrackStrokeColor={colors.secondary}
                onClick={handleClick}
                onEnd={onRefresh}
              />
            </Flex>
            {/* TODO not need now */}
            {/* <HStack justifySelf={'end'} fontSize="sm" color={colors.textTertiary}>
              <HStack>
                <Text>{t('Match Deposit Ratio')}</Text>
                <QuestionToolTip iconType="info" label={t('When turned on, token amounts will be automatically swapped to the deposit ratio needed to create your position')} />
              </HStack>
              <Switch name="matchDepositRatio" defaultChecked={true} />
            </HStack> */}
          </HStack>
          <Collapse in={isSlippageOpen} animateOpacity>
            <SlippageSettingField onClose={onSlippageClose} />
          </Collapse>
          <CLMMTokenInputGroup
            disableSelectToken
            pool={poolInfo}
            readonly={!poolInfo || featureDisabled}
            tokenAmount={tokenAmount}
            onFocusChange={handleFocusChange}
            onAmountChange={handleAmountChange}
            token1Disable={disabledInput[0]}
            token2Disable={disabledInput[1]}
          />
          <Box mt="4">
            <Box px={[3, 4]} py="2" display="flex" flexDirection="row" justifyContent="space-between" alignItems="center" fontSize="sm">
              <Text color={colors.textSubtle}>{t('Total Deposit')}</Text>
              <Text color={colors.textPrimary}>{formatCurrency(totalDeposited, { symbol: '$', decimalPlaces: 2 })}</Text>
            </Box>
          </Box>
        </div>
        <FlexGap mt="15px" flexDirection="column" gap="2">
          <Button
            w="full"
            isLoading={sending}
            loadingText={`${t('Add Liquidity')}...`}
            isDisabled={!!error || featureDisabled}
            onClick={() => {
              logGTMPoolLiquidityAddCmfEvent()
              setIsSending(true)
              increaseLiquidityAct({
                poolInfo,
                position,
                liquidity: tickPriceRef.current.liquidity!,
                amountMaxA: new Decimal(tokenAmount[0]!).mul(10 ** poolInfo.mintA.decimals).toFixed(0),
                amountMaxB: new Decimal(tokenAmount[1]!).mul(10 ** poolInfo.mintB.decimals).toFixed(0),
                onCloseToast: () => setIsSending(false),
                onConfirmed: () => {
                  logGTMPoolLiquidityAddSuccessEvent({
                    walletAddress: wallet?.adapter.publicKey?.toString() ?? '',
                    token0: poolInfo.mintA.address.toString(),
                    token1: poolInfo.mintB.address.toString(),
                    token0Amt: tokenAmount[0],
                    token1Amt: tokenAmount[1],
                    feeTier: toPercentString(poolInfo.feeRate * 100)
                  })
                  setIsSending(false)
                  handleCloseModal()
                },
                onError: (e: any) => {
                  logGTMSolErrorLogEvent({
                    action: 'Add Liquidity Fail',
                    e
                  })
                  handleClick()
                  setIsSending(false)
                }
              })
            }}
          >
            {featureDisabled ? t('Disabled') : error || t('Confirm')}
          </Button>
          <Button w="full" variant="ghost" onClick={handleCloseModal}>
            {t('Cancel')}
          </Button>
        </FlexGap>
      </MotionModal>
    </ModalV2>
  )
}
